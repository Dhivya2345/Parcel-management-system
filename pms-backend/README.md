# Parcel Management System — Backend

Spring Boot 3 · Java 17 · MySQL · Spring Security (JWT) · Spring Data JPA

## 1. Run it

1. Install JDK 17+, Maven, MySQL 8.
2. Set DB credentials (or edit `application.properties`):
   ```
   export DB_USERNAME=root
   export DB_PASSWORD=yourpassword
   export JWT_SECRET="a-long-random-string-of-at-least-32-characters"
   ```
3. `mvn spring-boot:run` → API on http://localhost:8080  
   The `pms_db` database and all tables are created automatically (`ddl-auto=update`).
4. A seeded officer account is created on first start: **officer1 / Officer@1**
   (change with `OFFICER_PASSWORD`). Customers register through the API.

### Serving the frontend
- **Easiest (no CORS):** copy your `modules/`, `shared/` and `index.html` into `src/main/resources/static/`, open http://localhost:8080 and set `window.PMS_API_BASE = '/api'` before loading `pms-api.js`.
- **Separate server (e.g. VS Code Live Server on :5500):** add its origin to `app.cors.allowed-origins`. Opening files via `file://` will not work with CORS.

## 2. API

All bodies are JSON. Protected calls need `Authorization: Bearer <token>`.
Errors: `{ "timestamp", "status", "message", "errors": { "field.path": "message" } }`.

| Method & path | Role | Purpose |
|---|---|---|
| POST `/api/auth/register` | public | Register customer (`name,email,countryCode,mobile,address,userId,password,confirmPassword,preferences{emailUpdates,smsUpdates,ecoPackaging}`) |
| POST `/api/auth/login` | public | `{userId,password}` → `{token,userId,name,role,expiresInSeconds}` |
| GET `/api/users/me` | any | Profile (sender info) |
| POST `/api/bookings` | customer | Create booking `{receiver,parcel,shipping,schedule}` → booking with `bookingId` + server-calculated `cost`, payment `Pending` |
| POST `/api/bookings/{id}/payment` | customer | `{modeOfPayment,cardNumber,cardHolder,expiry,cvv}` → booking, payment `Successful` |
| GET `/api/bookings/my?page=1&size=10` | customer | Booking history (paid only, newest first) |
| GET `/api/bookings/track/{id}` | customer/officer | `{bookingId,status,receiverName,bookingDate}` (customers: own bookings only) |
| GET `/api/bookings/{id}` | customer/officer | Full booking (invoice, payment page, delivery-update search) |
| GET `/api/officer/bookings?customerId=&bookingId=&dateFrom=&dateTo=&page=&size=` | officer | Tracking + history search (partial match; dates `yyyy-MM-dd`) |
| PATCH `/api/officer/bookings/{id}/status` | officer | `{status}`: `Picked up`, `In Transit`, `Delivered`, `Returned` |

Paged responses: `{content[], page (1-based), size, totalElements, totalPages}`.

Booking JSON has the same shape the frontend used in localStorage:
`bookingId, customerId, sender{name,address,contact}, receiver{name,address,pin,contact}, parcel{weight,size,contents}, shipping{speed,packaging,insurance,trackingService}, schedule{pickupTime,dropoffTime}, cost, payment{status,method,time}, status, createdAt`.

## 3. Business rules implemented
- Cost = rate/kg (Standard 50, Express 100, Overnight 150) × weight + ₹50 insurance + ₹20 tracking — **calculated on the server**.
- Validation mirrors the frontend (6-digit pin, 10-digit contact, weight 0.1–50 kg, pickup in the future, drop-off ≥ pickup, password rules, 16-digit card, MM/YY not expired, 3-digit CVV).
- New booking flow: `POST /bookings` (pending) → `POST /bookings/{id}/payment`. Unpaid bookings are hidden from history/tracking and purged after 24 h. This replaces the old `pendingBooking` in localStorage.
- Card number/CVV are validated but **never stored or logged**. Payment is simulated — integrate a real gateway in `BookingService.pay()`.
- Passwords are BCrypt-hashed; JWT is stateless; officers can't self-register.

## 4. Changing the frontend
Add `<script src="../shared/pms-api.js"></script>` after `pms-helpers.js` and replace localStorage calls with async calls:

| Page | Replace | With |
|---|---|---|
| login.js | `PMS.findUser` + hardcoded officer check | `await PMS_API.login(userId, password)` then redirect by `r.role`. **Remove the hardcoded `officer1` block.** |
| register.js | `PMS.saveUser(newUser)` | `await PMS_API.register({name,email,countryCode,mobile,address,userId,password,confirmPassword,preferences})` |
| booking.js | `PMS.findUser` (sender) / `PMS.setPendingBooking` | `PMS_API.me()` to fill sender; on submit `const b = await PMS_API.createBooking({receiver,parcel,shipping,schedule})`, then redirect to `payment.html?bookingId=` + `b.bookingId` |
| payment.js | `PMS.getPendingBooking` / `saveBooking` | `PMS_API.getBooking(id)` to show `cost`; on submit `await PMS_API.pay(id, {...})` |
| invoice.js | `PMS.findBooking` | `await PMS_API.getBooking(id)` |
| tracking-customer.js | `PMS.findBooking` | `await PMS_API.track(id)` |
| tracking-officer.js / history-officer.js | `PMS.getBookings()` + filters | `await PMS_API.officerSearch({customerId, bookingId, dateFrom, dateTo, page})` |
| history-customer.js | `PMS.getBookings()` | `await PMS_API.myBookings(page)` |
| delivery-update.js | `PMS.findBooking` / `updateBooking` | `PMS_API.getBooking(id)` / `PMS_API.updateStatus(id, newStatus)` |
| logout | `PMS.clearSession()` | `PMS_API.logout()` |

Validation errors come back as `err.errors`, keyed by path (e.g. `receiver.pin`, `schedule.pickupTime`). Map them to your `PMS.showError('receiverPin', ...)` ids.

## 5. Frontend issues spotted
- `payment.html`: `<div class="card-title-display" ...>Credit Card</div` is missing the closing `>`, which breaks the markup after it.
- `login.js` has hardcoded officer credentials, which the backend now handles.
- Invoice shows weight in grams (`weight × 1000`) — fine, the API returns kg.

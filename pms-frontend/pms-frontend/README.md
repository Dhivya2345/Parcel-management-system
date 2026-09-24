# Parcel Management System — Frontend

Plain HTML / CSS / JavaScript. Talks to the Spring Boot backend (`pms-backend.zip`) over REST.

## Run
1. Start the backend (http://localhost:8080).
2. Serve this folder with any static server, for example VS Code **Live Server** on port 5500
   (open `index.html`), or `npx serve -l 5500 .`
   Do not open the files with `file://` (the backend blocks that origin via CORS).
3. Log in as the officer `officer1` / `Officer@1`, or register a customer.

## Changing the backend URL
Edit `PMS_API_BASE` at the top of `modules/shared/pms-helpers.js`
(default `http://localhost:8080/api`). If your frontend runs on a different port,
add its origin to `app.cors.allowed-origins` in the backend `application.properties`.

## What changed vs your original code
- `modules/shared/pms-helpers.js`: localStorage data layer replaced by `PMS_API` (fetch calls with JWT). Session helpers are unchanged.
- JS files of login, register, booking, payment, invoice, tracking, history and delivery-update now call the API.
- Booking -> payment now passes `?bookingId=` in the URL instead of `pendingBooking` in localStorage.
- `payment.html`: fixed the unclosed `</div` tag.
- HTML and CSS are otherwise unchanged.
- Not included (unused in the original): `logout.js`, `navbar.html`, `index.css`.

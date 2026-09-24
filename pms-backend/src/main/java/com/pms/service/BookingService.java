package com.pms.service;

import com.pms.dto.*;
import com.pms.exception.ApiException;
import com.pms.model.*;
import com.pms.repository.BookingRepository;
import com.pms.repository.BookingSpecs;
import com.pms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class BookingService {

    private static final BigDecimal INSURANCE_FEE = BigDecimal.valueOf(50);
    private static final BigDecimal TRACKING_FEE = BigDecimal.valueOf(20);
    private static final String VALIDATION_MSG = "Please fix the highlighted fields and try again.";

    private final BookingRepository bookings;
    private final UserRepository users;
    private final ZoneId zone;
    private final SecureRandom random = new SecureRandom();

    public BookingService(BookingRepository bookings, UserRepository users, @Value("${app.timezone}") String timezone) {
        this.bookings = bookings;
        this.users = users;
        this.zone = ZoneId.of(timezone);
    }

    // ------------------------------------------------------------------ create + pay

    /** Creates the booking with payment PENDING. It stays hidden from history/tracking until paid. */
    @Transactional
    public BookingResponse create(String userId, BookingRequest req) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User account not found."));
        validateSchedule(req.schedule());

        Booking b = new Booking();
        b.setBookingId(generateBookingId());
        b.setCustomerId(user.getUserId());
        b.setSenderName(user.getName());
        b.setSenderAddress(user.getAddress());
        b.setSenderContact(user.getMobile());

        ReceiverDto r = req.receiver();
        b.setReceiverName(r.name().trim());
        b.setReceiverAddress(r.address().trim());
        b.setReceiverPin(r.pin().trim());
        b.setReceiverContact(r.contact().trim());

        ParcelDto p = req.parcel();
        BigDecimal weight = p.weight().setScale(2, RoundingMode.HALF_UP);
        b.setParcelWeight(weight);
        b.setParcelSize(p.size());
        b.setParcelContents(p.contents().trim());

        ShippingDto s = req.shipping();
        b.setDeliverySpeed(s.speed());
        b.setPackaging(s.packaging());
        b.setInsurance(s.insurance());
        b.setTrackingService(s.trackingService());

        b.setPickupTime(req.schedule().pickupTime());
        b.setDropoffTime(req.schedule().dropoffTime());
        b.setCost(calculateCost(s, weight));

        b.setPaymentStatus(PaymentStatus.PENDING);
        b.setStatus(BookingStatus.PICKED_UP);
        return BookingResponse.from(bookings.save(b));
    }

    /**
     * Simulated payment: validates the card fields and marks the booking paid.
     * Card number / CVV are validated but NEVER stored. Plug a real gateway in here.
     */
    @Transactional
    public BookingResponse pay(String userId, String bookingId, PaymentRequest req) {
        Booking b = bookings.findForUpdate(bookingId)
                .filter(x -> x.getCustomerId().equals(userId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No booking found for this Booking ID."));

        if (b.getPaymentStatus() == PaymentStatus.SUCCESSFUL) {
            throw new ApiException(HttpStatus.CONFLICT, "This booking has already been paid.");
        }

        int month = Integer.parseInt(req.expiry().substring(0, 2));
        int year = 2000 + Integer.parseInt(req.expiry().substring(3, 5));
        if (YearMonth.of(year, month).isBefore(YearMonth.now(zone))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, VALIDATION_MSG,
                    Map.of("expiry", "Enter a valid expiry in MM/YY format that is not in the past."));
        }

        b.setPaymentStatus(PaymentStatus.SUCCESSFUL);
        b.setPaymentMethod(req.modeOfPayment());
        b.setPaymentTime(Instant.now());
        return BookingResponse.from(b);
    }

    // ------------------------------------------------------------------ reads

    /** Customer: own bookings only (incl. unpaid, needed by the payment page). Officer: paid bookings. */
    @Transactional(readOnly = true)
    public BookingResponse get(String bookingId, String userId, boolean officer) {
        return BookingResponse.from(findVisible(bookingId, userId, officer, false));
    }

    /** Customer can track only their own paid bookings; officers any paid booking. */
    @Transactional(readOnly = true)
    public TrackingResponse track(String bookingId, String userId, boolean officer) {
        return TrackingResponse.from(findVisible(bookingId, userId, officer, true));
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> myHistory(String userId, int page, int size) {
        return PageResponse.of(
                bookings.findByCustomerIdAndPaymentStatus(userId, PaymentStatus.SUCCESSFUL, pageable(page, size))
                        .map(BookingResponse::from));
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> officerSearch(String customerId, String bookingId,
                                                       LocalDate dateFrom, LocalDate dateTo, int page, int size) {
        if (dateFrom != null && dateTo != null && dateTo.isBefore(dateFrom)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, VALIDATION_MSG,
                    Map.of("dateTo", "Date To cannot be before Date From."));
        }
        Instant from = dateFrom == null ? null : dateFrom.atStartOfDay(zone).toInstant();
        Instant toExclusive = dateTo == null ? null : dateTo.plusDays(1).atStartOfDay(zone).toInstant();
        return PageResponse.of(
                bookings.findAll(BookingSpecs.officerSearch(customerId, bookingId, from, toExclusive), pageable(page, size))
                        .map(BookingResponse::from));
    }

    // ------------------------------------------------------------------ officer update

    @Transactional
    public BookingResponse updateStatus(String bookingId, BookingStatus status) {
        Booking b = bookings.findById(bookingId)
                .filter(x -> x.getPaymentStatus() == PaymentStatus.SUCCESSFUL)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No booking found for that Booking ID."));
        b.setStatus(status);
        return BookingResponse.from(b);
    }

    // ------------------------------------------------------------------ housekeeping

    /** Removes bookings that were created but never paid within 24h. */
    @Scheduled(fixedRate = 3_600_000L)
    @Transactional
    public void purgeUnpaidBookings() {
        bookings.deleteStale(PaymentStatus.PENDING, Instant.now().minus(24, ChronoUnit.HOURS));
    }

    // ------------------------------------------------------------------ helpers

    private Booking findVisible(String bookingId, String userId, boolean officer, boolean paidOnly) {
        Booking b = bookings.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No booking found for that Booking ID."));
        boolean paid = b.getPaymentStatus() == PaymentStatus.SUCCESSFUL;
        boolean visible = officer ? paid : (b.getCustomerId().equals(userId) && (paid || !paidOnly));
        if (!visible) {
            // 404 instead of 403 so booking IDs cannot be probed
            throw new ApiException(HttpStatus.NOT_FOUND, "No booking found for that Booking ID.");
        }
        return b;
    }

    private BigDecimal calculateCost(ShippingDto s, BigDecimal weight) {
        BigDecimal cost = BigDecimal.valueOf(s.speed().getRatePerKg()).multiply(weight);
        if (s.insurance()) cost = cost.add(INSURANCE_FEE);
        if (s.trackingService()) cost = cost.add(TRACKING_FEE);
        return cost.setScale(2, RoundingMode.HALF_UP);
    }

    private void validateSchedule(ScheduleDto sc) {
        Map<String, String> errors = new LinkedHashMap<>();
        if (sc.pickupTime().isBefore(LocalDateTime.now(zone))) {
            errors.put("schedule.pickupTime", "Pickup time must be after the current date and time.");
        }
        if (sc.dropoffTime().isBefore(sc.pickupTime())) {
            errors.put("schedule.dropoffTime", "Drop-off time cannot be before pickup time.");
        }
        if (!errors.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, VALIDATION_MSG, errors);
        }
    }

    private String generateBookingId() {
        for (int i = 0; i < 10; i++) {
            String id = String.valueOf(100_000_000_000L + random.nextLong(900_000_000_000L)); // 12 digits
            if (!bookings.existsById(id)) return id;
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not generate a booking ID. Please try again.");
    }

    private Pageable pageable(int page, int size) {
        return PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}

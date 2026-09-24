package com.pms.controller;

import com.pms.dto.*;
import com.pms.security.AuthUtil;
import com.pms.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    /** Booking page -> creates the booking (payment pending) and returns the bill amount + bookingId. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(Authentication auth, @Valid @RequestBody BookingRequest request) {
        return service.create(auth.getName(), request);
    }

    /** Payment page -> pay for the booking created above. */
    @PostMapping("/{bookingId}/payment")
    public BookingResponse pay(Authentication auth, @PathVariable String bookingId,
                               @Valid @RequestBody PaymentRequest request) {
        return service.pay(auth.getName(), bookingId, request);
    }

    /** Customer booking history (history-customer page). page is 1-based. */
    @GetMapping("/my")
    public PageResponse<BookingResponse> myBookings(Authentication auth,
                                                    @RequestParam(defaultValue = "1") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return service.myHistory(auth.getName(), page, size);
    }

    /** Tracking page (customer: own bookings only). */
    @GetMapping("/track/{bookingId}")
    public TrackingResponse track(Authentication auth, @PathVariable String bookingId) {
        return service.track(bookingId, auth.getName(), AuthUtil.isOfficer(auth));
    }

    /** Invoice / payment page / delivery-update search. */
    @GetMapping("/{bookingId}")
    public BookingResponse get(Authentication auth, @PathVariable String bookingId) {
        return service.get(bookingId, auth.getName(), AuthUtil.isOfficer(auth));
    }
}

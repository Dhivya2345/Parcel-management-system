package com.pms.dto;

import com.pms.model.Booking;
import com.pms.model.BookingStatus;

import java.time.Instant;

public record TrackingResponse(String bookingId, BookingStatus status, String receiverName, Instant bookingDate) {
    public static TrackingResponse from(Booking b) {
        return new TrackingResponse(b.getBookingId(), b.getStatus(), b.getReceiverName(), b.getCreatedAt());
    }
}

package com.pms.dto;

import com.pms.model.Booking;
import com.pms.model.BookingStatus;

import java.math.BigDecimal;
import java.time.Instant;

/** Same shape as the booking object the frontend used to keep in localStorage. */
public record BookingResponse(
        String bookingId,
        String customerId,
        PartyDto sender,
        ReceiverDto receiver,
        ParcelDto parcel,
        ShippingDto shipping,
        ScheduleDto schedule,
        BigDecimal cost,
        PaymentDto payment,
        BookingStatus status,
        Instant createdAt) {

    public static BookingResponse from(Booking b) {
        return new BookingResponse(
                b.getBookingId(),
                b.getCustomerId(),
                new PartyDto(b.getSenderName(), b.getSenderAddress(), b.getSenderContact()),
                new ReceiverDto(b.getReceiverName(), b.getReceiverAddress(), b.getReceiverPin(), b.getReceiverContact()),
                new ParcelDto(b.getParcelWeight(), b.getParcelSize(), b.getParcelContents()),
                new ShippingDto(b.getDeliverySpeed(), b.getPackaging(), b.isInsurance(), b.isTrackingService()),
                new ScheduleDto(b.getPickupTime(), b.getDropoffTime()),
                b.getCost(),
                new PaymentDto(b.getPaymentStatus(), b.getPaymentMethod(), b.getPaymentTime()),
                b.getStatus(),
                b.getCreatedAt());
    }
}

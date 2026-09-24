package com.pms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_bookings_customer", columnList = "customer_id"),
        @Index(name = "idx_bookings_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
public class Booking {

    @Id
    @Column(name = "booking_id", length = 12)
    private String bookingId;

    @Column(name = "customer_id", nullable = false, length = 20)
    private String customerId;

    // Sender snapshot (copied from the customer profile at booking time)
    @Column(name = "sender_name", length = 50)
    private String senderName;
    @Column(name = "sender_address", length = 500)
    private String senderAddress;
    @Column(name = "sender_contact", length = 20)
    private String senderContact;

    // Receiver
    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;
    @Column(name = "receiver_address", nullable = false, length = 500)
    private String receiverAddress;
    @Column(name = "receiver_pin", nullable = false, length = 6)
    private String receiverPin;
    @Column(name = "receiver_contact", nullable = false, length = 10)
    private String receiverContact;

    // Parcel
    @Column(name = "parcel_weight", nullable = false, precision = 6, scale = 2)
    private BigDecimal parcelWeight;
    @Enumerated(EnumType.STRING)
    @Column(name = "parcel_size", nullable = false, length = 10)
    private ParcelSize parcelSize;
    @Column(name = "parcel_contents", nullable = false, length = 500)
    private String parcelContents;

    // Shipping options
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_speed", nullable = false, length = 15)
    private DeliverySpeed deliverySpeed;
    @Column(nullable = false, length = 40)
    private String packaging;
    @Column(nullable = false)
    private boolean insurance;
    @Column(name = "tracking_service", nullable = false)
    private boolean trackingService;

    // Schedule (local date-time chosen by the customer)
    @Column(name = "pickup_time", nullable = false)
    private LocalDateTime pickupTime;
    @Column(name = "dropoff_time", nullable = false)
    private LocalDateTime dropoffTime;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    // Payment
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 15)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 10)
    private PaymentMethod paymentMethod;
    @Column(name = "payment_time")
    private Instant paymentTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PICKED_UP;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}

package com.pms.repository;

import com.pms.model.Booking;
import com.pms.model.PaymentStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class BookingSpecs {

    private BookingSpecs() {
    }

    /** Only paid bookings, with optional partial-match filters (officer search screens). */
    public static Specification<Booking> officerSearch(String customerId, String bookingId, Instant from, Instant toExclusive) {
        return (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            ps.add(cb.equal(root.get("paymentStatus"), PaymentStatus.SUCCESSFUL));
            if (customerId != null && !customerId.isBlank()) {
                ps.add(cb.like(cb.lower(root.<String>get("customerId")), contains(customerId), '\\'));
            }
            if (bookingId != null && !bookingId.isBlank()) {
                ps.add(cb.like(root.<String>get("bookingId"), contains(bookingId), '\\'));
            }
            if (from != null) {
                ps.add(cb.greaterThanOrEqualTo(root.<Instant>get("createdAt"), from));
            }
            if (toExclusive != null) {
                ps.add(cb.lessThan(root.<Instant>get("createdAt"), toExclusive));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }

    private static String contains(String s) {
        String escaped = s.trim().toLowerCase()
                .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }
}

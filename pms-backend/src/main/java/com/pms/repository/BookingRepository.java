package com.pms.repository;

import com.pms.model.Booking;
import com.pms.model.PaymentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, String>, JpaSpecificationExecutor<Booking> {

    Page<Booking> findByCustomerIdAndPaymentStatus(String customerId, PaymentStatus status, Pageable pageable);

    /** Row lock so a booking cannot be paid twice by concurrent requests. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.bookingId = :id")
    Optional<Booking> findForUpdate(@Param("id") String id);

    @Modifying
    @Query("delete from Booking b where b.paymentStatus = :status and b.createdAt < :cutoff")
    int deleteStale(@Param("status") PaymentStatus status, @Param("cutoff") Instant cutoff);
}

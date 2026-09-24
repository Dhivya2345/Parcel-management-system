package com.pms.controller;

import com.pms.dto.BookingResponse;
import com.pms.dto.PageResponse;
import com.pms.dto.StatusUpdateRequest;
import com.pms.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/officer/bookings")
public class OfficerController {

    private final BookingService service;

    public OfficerController(BookingService service) {
        this.service = service;
    }

    /**
     * Used by both officer screens:
     *  - tracking-officer: customerId / bookingId filters
     *  - history-officer:  customerId / dateFrom / dateTo filters
     * All filters are optional. Dates are yyyy-MM-dd. page is 1-based.
     */
    @GetMapping
    public PageResponse<BookingResponse> search(
            @RequestParam(required = false) String customerId,
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.officerSearch(customerId, bookingId, dateFrom, dateTo, page, size);
    }

    /** delivery-update page. */
    @PatchMapping("/{bookingId}/status")
    public BookingResponse updateStatus(@PathVariable String bookingId,
                                        @Valid @RequestBody StatusUpdateRequest request) {
        return service.updateStatus(bookingId, request.status());
    }
}

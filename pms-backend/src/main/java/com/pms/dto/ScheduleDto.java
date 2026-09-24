package com.pms.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/** Accepts the value of an HTML datetime-local input, e.g. "2026-09-25T10:30". */
public record ScheduleDto(
        @NotNull(message = "Please choose a pickup date and time.") LocalDateTime pickupTime,
        @NotNull(message = "Please choose a drop-off date and time.") LocalDateTime dropoffTime) {
}

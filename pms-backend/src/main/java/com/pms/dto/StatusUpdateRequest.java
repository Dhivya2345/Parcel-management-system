package com.pms.dto;

import com.pms.model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull(message = "Please select a valid status.") BookingStatus status) {
}

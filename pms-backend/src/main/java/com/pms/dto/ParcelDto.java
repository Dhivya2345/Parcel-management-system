package com.pms.dto;

import com.pms.model.ParcelSize;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ParcelDto(
        @NotNull(message = "Enter a valid weight between 0.1 and 50 kg.")
        @DecimalMin(value = "0.1", message = "Enter a valid weight between 0.1 and 50 kg.")
        @DecimalMax(value = "50", message = "Enter a valid weight between 0.1 and 50 kg.")
        BigDecimal weight,

        @NotNull(message = "Please select a parcel size.")
        ParcelSize size,

        @NotBlank(message = "Please describe the parcel contents.")
        @Size(max = 500, message = "Contents description must be 500 characters or fewer.")
        String contents) {
}

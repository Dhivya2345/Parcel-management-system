package com.pms.dto;

import com.pms.model.DeliverySpeed;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ShippingDto(
        @NotNull(message = "Please select a delivery speed.")
        DeliverySpeed speed,

        @NotBlank(message = "Please select a packaging preference.")
        @Pattern(regexp = Patterns.PACKAGING, message = "Please select a valid packaging preference.")
        String packaging,

        boolean insurance,
        boolean trackingService) {
}

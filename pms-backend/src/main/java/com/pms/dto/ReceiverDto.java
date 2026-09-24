package com.pms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReceiverDto(
        @NotBlank(message = "Receiver name is required.")
        @Size(max = 100, message = "Receiver name must be 100 characters or fewer.")
        String name,

        @NotBlank(message = "Receiver address is required.")
        @Size(max = 500, message = "Receiver address must be 500 characters or fewer.")
        String address,

        @NotBlank(message = "Pin code must be exactly 6 digits.")
        @Pattern(regexp = "^\\d{6}$", message = "Pin code must be exactly 6 digits.")
        String pin,

        @NotBlank(message = "Contact number must be exactly 10 digits.")
        @Pattern(regexp = "^\\d{10}$", message = "Contact number must be exactly 10 digits.")
        String contact) {
}

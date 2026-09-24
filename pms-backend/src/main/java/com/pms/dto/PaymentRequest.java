package com.pms.dto;

import com.pms.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PaymentRequest(
        @NotNull(message = "Please select a mode of payment.")
        PaymentMethod modeOfPayment,

        @NotBlank(message = "Card number must be exactly 16 digits.")
        @Pattern(regexp = "^\\d{16}$", message = "Card number must be exactly 16 digits.")
        String cardNumber,

        @NotBlank(message = "Card holder name is required.")
        String cardHolder,

        @NotBlank(message = "Enter a valid expiry in MM/YY format that is not in the past.")
        @Pattern(regexp = "^(0[1-9]|1[0-2])/\\d{2}$", message = "Enter a valid expiry in MM/YY format that is not in the past.")
        String expiry,

        @NotBlank(message = "CVV must be exactly 3 digits.")
        @Pattern(regexp = "^\\d{3}$", message = "CVV must be exactly 3 digits.")
        String cvv) {

    /** Never let card data end up in logs. */
    @Override
    public String toString() {
        return "PaymentRequest[***]";
    }
}

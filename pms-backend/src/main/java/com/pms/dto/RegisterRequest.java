package com.pms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Name is required.")
        @Size(max = 50, message = "Name must be 50 characters or fewer.")
        String name,

        @NotBlank(message = "Enter a valid email address.")
        @Pattern(regexp = Patterns.EMAIL, message = "Enter a valid email address.")
        @Size(max = 100, message = "Email must be 100 characters or fewer.")
        String email,

        /** Optional, defaults to +91. */
        @Pattern(regexp = "^\\+\\d{1,4}$", message = "Invalid country code.")
        String countryCode,

        @NotBlank(message = "Mobile number must be exactly 10 digits.")
        @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits.")
        String mobile,

        @NotBlank(message = "Address is required.")
        @Size(max = 500, message = "Address must be 500 characters or fewer.")
        String address,

        @NotBlank(message = "User ID must be between 5 and 20 characters.")
        @Size(min = 5, max = 20, message = "User ID must be between 5 and 20 characters.")
        String userId,

        @NotBlank(message = "Password is required.")
        @Pattern(regexp = Patterns.PASSWORD,
                message = "Password must be at most 30 characters and include an uppercase letter, a lowercase letter, and a special character.")
        String password,

        @NotBlank(message = "Passwords do not match.")
        String confirmPassword,

        Preferences preferences) {

    public record Preferences(boolean emailUpdates, boolean smsUpdates, boolean ecoPackaging) {
    }

    @Override
    public String toString() {
        return "RegisterRequest[userId=" + userId + "]";
    }
}

package com.pms.dto;

public final class Patterns {
    private Patterns() {
    }

    /** Max 30 chars, at least one uppercase, one lowercase and one special character. */
    public static final String PASSWORD = "^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{1,30}$";
    public static final String EMAIL = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
    public static final String PACKAGING =
            "^(Standard Packaging|Custom Packaging|Eco-friendly Packaging|Fragile Item handling)$";
}

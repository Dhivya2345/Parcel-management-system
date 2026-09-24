package com.pms.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum BookingStatus {
    PICKED_UP("Picked up"),
    IN_TRANSIT("In Transit"),
    DELIVERED("Delivered"),
    RETURNED("Returned");

    private final String label;

    BookingStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    /** Returns null for unknown values so bean validation can report a friendly message. */
    @JsonCreator
    public static BookingStatus fromLabel(String value) {
        if (value == null) return null;
        String v = value.trim();
        for (BookingStatus s : values()) {
            if (s.label.equalsIgnoreCase(v) || s.name().equalsIgnoreCase(v)) return s;
        }
        return null;
    }
}

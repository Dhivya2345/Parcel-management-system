package com.pms.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentStatus {
    PENDING("Pending"),
    SUCCESSFUL("Successful");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }
}

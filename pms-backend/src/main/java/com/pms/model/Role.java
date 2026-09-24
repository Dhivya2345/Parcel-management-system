package com.pms.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    CUSTOMER, OFFICER;

    /** Frontend uses lowercase: 'customer' / 'officer'. */
    @JsonValue
    public String json() {
        return name().toLowerCase();
    }
}

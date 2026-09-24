package com.pms.model;

/** Constant names match the values sent by the frontend dropdown. */
public enum DeliverySpeed {
    Standard(50),
    Express(100),
    Overnight(150);

    private final int ratePerKg;

    DeliverySpeed(int ratePerKg) {
        this.ratePerKg = ratePerKg;
    }

    public int getRatePerKg() {
        return ratePerKg;
    }
}

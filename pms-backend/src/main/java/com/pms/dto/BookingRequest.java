package com.pms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

/** Sender comes from the logged-in user; cost is always calculated server-side. */
public record BookingRequest(
        @Valid @NotNull ReceiverDto receiver,
        @Valid @NotNull ParcelDto parcel,
        @Valid @NotNull ShippingDto shipping,
        @Valid @NotNull ScheduleDto schedule) {
}

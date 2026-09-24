package com.pms.dto;

import com.pms.model.PaymentMethod;
import com.pms.model.PaymentStatus;

import java.time.Instant;

public record PaymentDto(PaymentStatus status, PaymentMethod method, Instant time) {
}

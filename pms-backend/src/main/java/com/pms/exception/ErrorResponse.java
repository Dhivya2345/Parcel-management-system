package com.pms.exception;

import java.time.Instant;
import java.util.Map;

/** errors: field path -> message, e.g. {"receiver.pin": "Pin code must be exactly 6 digits."} */
public record ErrorResponse(Instant timestamp, int status, String message, Map<String, String> errors) {
}

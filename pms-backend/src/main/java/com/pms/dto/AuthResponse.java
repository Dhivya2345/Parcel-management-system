package com.pms.dto;

import com.pms.model.Role;

public record AuthResponse(String token, String userId, String name, Role role, long expiresInSeconds) {
}

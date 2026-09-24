package com.pms.dto;

import com.pms.model.Role;
import com.pms.model.User;

public record ProfileResponse(String userId, String name, String email, String mobile, String address, Role role) {
    public static ProfileResponse from(User u) {
        return new ProfileResponse(u.getUserId(), u.getName(), u.getEmail(), u.getMobile(), u.getAddress(), u.getRole());
    }
}

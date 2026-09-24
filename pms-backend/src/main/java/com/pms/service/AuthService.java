package com.pms.service;

import com.pms.dto.*;
import com.pms.exception.ApiException;
import com.pms.model.Role;
import com.pms.model.User;
import com.pms.repository.UserRepository;
import com.pms.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest r) {
        if (!r.password().equals(r.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields and try again.",
                    Map.of("confirmPassword", "Passwords do not match."));
        }
        String userId = r.userId().trim();
        if (userId.length() < 5 || userId.length() > 20) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields and try again.",
                    Map.of("userId", "User ID must be between 5 and 20 characters."));
        }
        if (users.existsById(userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "This User ID is already taken.",
                    Map.of("userId", "This User ID is already taken."));
        }

        String code = (r.countryCode() == null || r.countryCode().isBlank()) ? "+91" : r.countryCode();
        RegisterRequest.Preferences prefs = r.preferences() != null
                ? r.preferences() : new RegisterRequest.Preferences(false, false, false);

        User u = new User();
        u.setUserId(userId);
        u.setPasswordHash(encoder.encode(r.password()));
        u.setRole(Role.CUSTOMER); // self-registration always creates customers
        u.setName(r.name().trim());
        u.setEmail(r.email().trim());
        u.setMobile(code + r.mobile().trim());
        u.setAddress(r.address().trim());
        u.setPrefEmailUpdates(prefs.emailUpdates());
        u.setPrefSmsUpdates(prefs.smsUpdates());
        u.setPrefEcoPackaging(prefs.ecoPackaging());
        users.save(u);

        return new RegisterResponse(u.getUserId(), u.getName(), u.getEmail());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest r) {
        User u = users.findById(r.userId().trim()).orElse(null);
        if (u == null || !encoder.matches(r.password(), u.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid User ID or password.");
        }
        return new AuthResponse(jwt.generate(u.getUserId(), u.getRole()),
                u.getUserId(), u.getName(), u.getRole(), jwt.getExpirySeconds());
    }

    @Transactional(readOnly = true)
    public ProfileResponse profile(String userId) {
        return users.findById(userId)
                .map(ProfileResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found."));
    }
}

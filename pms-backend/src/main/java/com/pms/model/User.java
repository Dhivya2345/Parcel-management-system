package com.pms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @Column(name = "user_id", length = 20)
    private String userId;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 100)
    private String email;

    /** Stored with country code, e.g. +919876543210 (same as the frontend did). */
    @Column(length = 20)
    private String mobile;

    @Column(length = 500)
    private String address;

    @Column(name = "pref_email_updates", nullable = false)
    private boolean prefEmailUpdates;

    @Column(name = "pref_sms_updates", nullable = false)
    private boolean prefSmsUpdates;

    @Column(name = "pref_eco_packaging", nullable = false)
    private boolean prefEcoPackaging;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}

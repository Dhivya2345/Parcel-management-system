package com.pms.config;

import com.pms.model.Role;
import com.pms.model.User;
import com.pms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seeds the officer account (officer1) on first start. Officers cannot self-register. */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String officerPassword;

    public DataInitializer(UserRepository users, PasswordEncoder encoder,
                           @Value("${app.seed.officer-password}") String officerPassword) {
        this.users = users;
        this.encoder = encoder;
        this.officerPassword = officerPassword;
    }

    @Override
    public void run(String... args) {
        if (!users.existsById("officer1")) {
            User officer = new User();
            officer.setUserId("officer1");
            officer.setPasswordHash(encoder.encode(officerPassword));
            officer.setRole(Role.OFFICER);
            officer.setName("Officer");
            users.save(officer);
        }
    }
}

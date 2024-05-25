package com.spring.ibe.repository;

import com.spring.ibe.entity.GuestUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestUserRepository extends JpaRepository<GuestUser, Long> {
    GuestUser findByEmailId(String emailId);
}

package com.spring.ibe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "guest_user")
public class GuestUser {
    @Id
    private Long userId;
    private String emailId;
    @Column(columnDefinition = "TEXT")
    private String token;
    private boolean hasSubscribed = false;
}

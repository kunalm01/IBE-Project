package com.spring.ibe.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GuestUserRequestDTO {
    private String emailId;
    private String token;
}

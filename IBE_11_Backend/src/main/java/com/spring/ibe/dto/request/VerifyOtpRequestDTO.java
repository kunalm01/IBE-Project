package com.spring.ibe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VerifyOtpRequestDTO {
    @NotNull(message = "Booking ID must not be null")
    private Long bookingId;

    @NotBlank(message = "OTP must not be blank")
    private String otp;
}

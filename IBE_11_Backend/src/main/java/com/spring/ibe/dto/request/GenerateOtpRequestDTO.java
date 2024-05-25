package com.spring.ibe.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenerateOtpRequestDTO {
    @NotNull(message = "Booking ID must not be null")
    private Long bookingId;

    @NotBlank(message = "Email ID must not be blank")
    @Email(message = "Invalid email address")
    private String emailId;
}

package com.spring.ibe.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequestDTO {
    @NotNull
    private long tenantId;
    @NotNull
    private long roomTypeId;
    @NotBlank
    @Email(message = "Invalid email address")
    @NotBlank
    private String recipientAddress;
    @NotBlank
    private String firstName;
    private String lastName;
    @Valid
    private BookingDetails bookingDetails;
    @NotNull
    private EmailType emailType;

    public enum EmailType {
        CONFIRMATION,
        REVIEW
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingDetails {
        @NotBlank
        private String roomType;

        @PositiveOrZero(message = "Room count must be a positive number or zero")
        private Long roomCount;

        @NotBlank
        private String startDate;

        @NotBlank
        private String endDate;
    }
}

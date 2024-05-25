package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewBookingResponseDTO {
    private Long tenantId;
    private Long roomTypeId;
    private String roomTypeName;
}
package com.spring.ibe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRateRequestDTO {
    @NotBlank
    private String startDate;
    @NotBlank
    private String endDate;

    private Integer propertyId = 11;
    @NotNull
    private Integer roomTypeId;
}
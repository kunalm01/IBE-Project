package com.spring.ibe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomIdRequestDTO {
    @NotBlank
    private String startDate;
    @NotBlank
    private String endDate;
    @NotNull
    private Long roomTypeId;
    private Long propertyId = 11L;
    @NotNull
    private Long roomCount;
}
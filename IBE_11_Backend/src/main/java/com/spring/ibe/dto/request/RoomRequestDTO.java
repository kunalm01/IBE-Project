package com.spring.ibe.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO class for room requests.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequestDTO {
    @NotBlank
    private String startDate;
    @NotBlank
    private String endDate;

    private Integer propertyId = 11;

    private String roomTypeName = "";

    private Integer singleBed = 0;

    private Integer doubleBed = 0;

    private Integer area = 0;

    private Integer minCapacity = 0;

    private Integer maxPrice = 0;

    private String sort = "";

    private Integer totalCounts = 1;

    private Integer totalRoomsSelected = 1;

    private Integer totalBedsSelected = 1;
}

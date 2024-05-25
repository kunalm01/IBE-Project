package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO class representing room type rate response.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomTypeRateResponseDTO {
    private Map<String, Double> roomTypeRates;
    private Map<String, Integer> roomTypeAvailability;
}

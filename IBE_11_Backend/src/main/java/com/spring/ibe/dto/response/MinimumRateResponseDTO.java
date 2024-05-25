package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class representing the minimum nightly rates stored as a string.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MinimumRateResponseDTO {
    private String minimumRates;
}

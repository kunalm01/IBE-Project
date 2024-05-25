package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class representing properties stored as a string.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponseDTO {
    private String properties;
}

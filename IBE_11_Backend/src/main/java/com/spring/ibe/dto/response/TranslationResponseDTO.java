package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO class representing translations stored as a string.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TranslationResponseDTO {
    private String translation;
}

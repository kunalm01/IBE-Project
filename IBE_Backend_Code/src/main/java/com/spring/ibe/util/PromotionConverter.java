package com.spring.ibe.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.dto.request.BookingRequestDTO;
import jakarta.persistence.AttributeConverter;

public class PromotionConverter implements AttributeConverter<BookingRequestDTO.PromotionDTO, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(BookingRequestDTO.PromotionDTO promotionDTO) {
        try {
            return objectMapper.writeValueAsString(promotionDTO);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting DTO to JSON", e);
        }
    }

    @Override
    public BookingRequestDTO.PromotionDTO convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, BookingRequestDTO.PromotionDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to DTO", e);
        }
    }
}

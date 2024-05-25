package com.spring.ibe.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.dto.request.BookingRequestDTO;
import jakarta.persistence.AttributeConverter;

public class CostConverter implements AttributeConverter<BookingRequestDTO.CostDTO, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(BookingRequestDTO.CostDTO costDTO) {
        try {
            return objectMapper.writeValueAsString(costDTO);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting DTO to JSON", e);
        }
    }

    @Override
    public BookingRequestDTO.CostDTO convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, BookingRequestDTO.CostDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to DTO", e);
        }
    }
}

package com.spring.ibe.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.dto.request.BookingRequestDTO;
import jakarta.persistence.AttributeConverter;

public class GuestConverter implements AttributeConverter<BookingRequestDTO.GuestDTO, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(BookingRequestDTO.GuestDTO guestDTO) {
        try {
            return objectMapper.writeValueAsString(guestDTO);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting DTO to JSON", e);
        }
    }

    @Override
    public BookingRequestDTO.GuestDTO convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, BookingRequestDTO.GuestDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to DTO", e);
        }
    }
}

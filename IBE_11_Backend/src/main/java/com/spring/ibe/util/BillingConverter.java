package com.spring.ibe.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.dto.request.BookingRequestDTO;
import jakarta.persistence.AttributeConverter;

public class BillingConverter implements AttributeConverter<BookingRequestDTO.BillingDTO, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(BookingRequestDTO.BillingDTO billingDTO) {
        try {
            return objectMapper.writeValueAsString(billingDTO);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting DTO to JSON", e);
        }
    }

    @Override
    public BookingRequestDTO.BillingDTO convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, BookingRequestDTO.BillingDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to DTO", e);
        }
    }
}

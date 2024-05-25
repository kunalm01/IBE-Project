package com.spring.ibe.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.dto.request.BookingRequestDTO;
import jakarta.persistence.AttributeConverter;

public class PaymentConverter implements AttributeConverter<BookingRequestDTO.PaymentDTO, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(BookingRequestDTO.PaymentDTO paymentDTO) {
        try {
            return objectMapper.writeValueAsString(paymentDTO);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting DTO to JSON", e);
        }
    }

    @Override
    public BookingRequestDTO.PaymentDTO convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, BookingRequestDTO.PaymentDTO.class);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting JSON to DTO", e);
        }
    }
}

package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * DTO class representing an error response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorDTO {
    /**
     * The error message.
     */
    String message;

    /**
     * The HTTP status code associated with the error.
     */
    HttpStatus statusCode;
}

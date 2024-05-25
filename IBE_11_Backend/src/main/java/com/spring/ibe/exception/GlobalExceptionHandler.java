package com.spring.ibe.exception;

import com.spring.ibe.dto.response.ErrorDTO;
import com.spring.ibe.exception.custom.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handles exception across the application
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles MethodArgumentNotValidException, which occurs when request data fails
     * validation.
     */
    @ExceptionHandler(value = { MethodArgumentNotValidException.class })
    public ResponseEntity<ErrorDTO> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles CustomException, which occurs apart from the other exception.
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorDTO> handleCustomException(CustomException ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles DataNotFoundException, which occurs when requested data is not found.
     */
    @ExceptionHandler(value = { DataNotFoundException.class })
    public ResponseEntity<ErrorDTO> handleDataNotFoundException(DataNotFoundException ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles UnProcessableEntityException, which occurs when the request is
     * semantically incorrect.
     */
    @ExceptionHandler(value = { UnprocessableEntityException.class })
    public ResponseEntity<ErrorDTO> handleUnProcessableEntityException(UnprocessableEntityException ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles UnauthorizedAccessException, which occurs when access to a resource
     * is unauthorized.
     */
    @ExceptionHandler(value = { UnauthorizedAccessException.class })
    public ResponseEntity<ErrorDTO> handleUnauthorizedAccessException(UnauthorizedAccessException ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.UNAUTHORIZED);
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handles FetchFailedException, which occurs when fetching data fails.
     */
    @ExceptionHandler(value = { FetchFailedException.class })
    public ResponseEntity<ErrorDTO> handleFetchFailedException(FetchFailedException ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.BAD_GATEWAY);
        return new ResponseEntity<>(error, HttpStatus.BAD_GATEWAY);
    }

    /**
     * Handles generic exceptions.
     */
    @ExceptionHandler(value = { Exception.class })
    public ResponseEntity<ErrorDTO> handleException(Exception ex) {
        ErrorDTO error = new ErrorDTO(ex.getMessage(), HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}

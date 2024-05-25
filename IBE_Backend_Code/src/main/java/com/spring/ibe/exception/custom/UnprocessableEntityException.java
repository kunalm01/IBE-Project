package com.spring.ibe.exception.custom;

/**
 * Custom exception indicating that the request was well-formed but contains
 * semantic errors.
 */
public class UnprocessableEntityException extends RuntimeException {
    public UnprocessableEntityException(String message) {
        super(message);
    }
}

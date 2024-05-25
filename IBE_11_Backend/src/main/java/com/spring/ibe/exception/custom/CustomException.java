package com.spring.ibe.exception.custom;

/***
 * Custom exception class for handling errors
 */
public class CustomException extends RuntimeException {
    public CustomException(String message) {
        super(message);
    }
}

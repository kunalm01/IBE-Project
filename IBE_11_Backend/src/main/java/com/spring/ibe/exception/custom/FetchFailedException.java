package com.spring.ibe.exception.custom;

/**
 * Custom exception indicating a failure to fetch data.
 */
public class FetchFailedException extends RuntimeException {
    public FetchFailedException(String message) {
        super(message);
    }
}

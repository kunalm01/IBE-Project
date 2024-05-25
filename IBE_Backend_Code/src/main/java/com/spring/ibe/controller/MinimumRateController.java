package com.spring.ibe.controller;

import com.spring.ibe.service.MinimumRateService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling endpoints related to minimum nightly rates.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class MinimumRateController {

    private final MinimumRateService minimumRateService;

    @Autowired
    public MinimumRateController(MinimumRateService minimumRateService) {
        this.minimumRateService = minimumRateService;
    }

    /**
     * GET endpoint to retrieve minimum nightly rates for the specified date range.
     *
     * @param startDate The start date of the date range.
     * @param endDate   The end date of the date range.
     * @return ResponseEntity containing the minimum nightly rates.
     */
    @GetMapping("/nightly-rate")
    public ResponseEntity<String> getMinimumRates(@Valid @RequestParam String startDate,
            @Valid @RequestParam String endDate) {
        log.info("Received request to retrieve minimum nightly rates for the date range: {} to {}", startDate, endDate);
        String minimumRates = minimumRateService.getMinimumRates(startDate, endDate).getMinimumRates();
        log.info("Minimum nightly rates retrieved successfully");
        return ResponseEntity.ok(minimumRates);
    }
}

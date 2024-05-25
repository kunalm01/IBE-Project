package com.spring.ibe.controller;

import com.spring.ibe.service.PropertyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling endpoints related to properties.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class PropertyController {

    private final PropertyService propertyService;

    @Autowired
    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    /**
     * GET endpoint to retrieve properties.
     *
     * @return ResponseEntity containing the properties.
     */
    @GetMapping("/property")
    public ResponseEntity<String> getProperties() {
        log.info("Received request to retrieve properties");
        String properties = propertyService.getProperties().getProperties();
        log.info("Retrieved properties successfully");
        return ResponseEntity.ok(properties);
    }
}

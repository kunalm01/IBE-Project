package com.spring.ibe.controller;

import com.spring.ibe.service.TranslationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling translation-related endpoints.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class TranslationController {

    private final TranslationService translationService;

    @Autowired
    public TranslationController(TranslationService translationService) {
        this.translationService = translationService;
    }

    /**
     * GET endpoint to retrieve translations.
     *
     * @return ResponseEntity containing the translations.
     */
    @GetMapping("/translation")
    public ResponseEntity<String> getTranslation() {
        log.info("Request received for translation");
        String translation = translationService.getTranslation().getTranslation();
        log.info("Translation retrieved successfully");
        return ResponseEntity.ok(translation);
    }
}

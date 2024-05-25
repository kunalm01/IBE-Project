package com.spring.ibe.service;

import com.spring.ibe.dto.response.TranslationResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service class for fetching translation data.
 */
@Slf4j
@Service
public class TranslationService {
    private final String translationUrl;
    private final RestTemplate restTemplate = new RestTemplate();

    public TranslationService(@Value("${app.translation_url}") String translationUrl) {
        this.translationUrl = translationUrl;
    }

    /**
     * Retrieves translation data from the specified URL.
     * 
     * @return TranslationResponseDTO containing the translation data.
     */
    @Cacheable("translation")
    public TranslationResponseDTO getTranslation() {
        log.info("Fetching translation from external service...");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        String responseBody = restTemplate.exchange(translationUrl, HttpMethod.GET, requestEntity, String.class)
                .getBody();

        log.info("Translation fetched successfully");
        return new TranslationResponseDTO(responseBody);
    }
}

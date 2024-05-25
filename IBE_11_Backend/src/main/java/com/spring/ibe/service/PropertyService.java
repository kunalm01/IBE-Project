package com.spring.ibe.service;

import com.spring.ibe.constants.Constants;
import com.spring.ibe.constants.GraphqlQuery;
import com.spring.ibe.dto.response.PropertyResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service class for interacting with property-related operations.
 */
@Slf4j
@Service
public class PropertyService {

    private final String graphqlUrl;
    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GET_PROPERTIES = GraphqlQuery.GET_PROPERTIES;

    /**
     * Constructor for initializing the PropertyService.
     *
     * @param graphqlUrl The GraphQL endpoint URL.
     * @param apiKey     The API key for authentication.
     */
    public PropertyService(@Value("${app.graphql_url}") String graphqlUrl,
            @Value("${app.graphql_api_key}") String apiKey) {
        this.graphqlUrl = graphqlUrl;
        this.apiKey = apiKey;
    }

    /**
     * Retrieves properties from the GraphQL endpoint.
     *
     * @return The response DTO containing the properties.
     */
    @Cacheable("properties")
    public PropertyResponseDTO getProperties() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);
            String requestBody = "{ \"query\": \"" + GET_PROPERTIES + "\" }";

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);

            log.info("Successfully retrieved properties from GraphQL endpoint.");

            return new PropertyResponseDTO(responseEntity.getBody());
        } catch (Exception e) {
            log.error("Error retrieving properties from GraphQL endpoint: {}", e.getMessage());
            throw new RuntimeException("Error retrieving properties from GraphQL endpoint", e);
        }
    }
}

package com.spring.ibe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.constants.Constants;
import com.spring.ibe.constants.GraphqlQuery;
import com.spring.ibe.dto.response.MinimumRateResponseDTO;
import com.spring.ibe.exception.custom.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.TreeMap;

/**
 * Service class for retrieving minimum nightly rates.
 */
@Service
@Slf4j
public class MinimumRateService {

    private final String graphqlUrl;
    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GET_NIGHTLY_RATES = GraphqlQuery.GET_NIGHTLY_RATES;

    /**
     * Constructor for MinimumRateService.
     * 
     * @param graphqlUrl The GraphQL URL.
     * @param apiKey     The API key for authorization.
     */
    public MinimumRateService(@Value("${app.graphql_url}") String graphqlUrl,
            @Value("${app.graphql_api_key}") String apiKey) {
        this.graphqlUrl = graphqlUrl;
        this.apiKey = apiKey;
    }

    /**
     * Retrieve minimum nightly rates.
     * 
     * @param startDate The start date.
     * @param endDate   The end date.
     * @return The DTO containing the minimum nightly rates.
     */
    @Cacheable("minimumRates")
    public MinimumRateResponseDTO getMinimumRates(String startDate, String endDate) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(Constants.API_KEY_TITLE, apiKey);

        String requestBody = "{ \"query\": \"" + GET_NIGHTLY_RATES + "\" }";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);
            MinimumRateResponseDTO minimumRateResponseDTO;
            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                minimumRateResponseDTO = new MinimumRateResponseDTO(filterRoomRates(jsonResponse, startDate, endDate));
                log.info("Successfully retrieved minimum nightly rates");
            } else {
                minimumRateResponseDTO = new MinimumRateResponseDTO(responseEntity.getBody());
                log.error("Failed to retrieve minimum nightly rates: Unexpected status code {}",
                        responseEntity.getStatusCode());
            }
            return minimumRateResponseDTO;
        } catch (Exception e) {
            log.error("Failed to retrieve minimum nightly rates: {}", e.getMessage());
            throw new CustomException("Failed to retrieve minimum nightly rates.");
        }
    }

    /**
     * Filter room rates based on start and end dates.
     * 
     * @param jsonResponse The JSON response.
     * @param startDate    The start date.
     * @param endDate      The end date.
     * @return The filtered room rates as a string.
     */
    @Cacheable("roomRates")
    private static String filterRoomRates(String jsonResponse, String startDate, String endDate) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(jsonResponse);

            JsonNode roomTypes = root.path("data").path("getProperty").path("room_type");

            Map<String, Integer> minRatesMap = new TreeMap<>();
            for (JsonNode roomType : roomTypes) {
                JsonNode roomRates = roomType.path("room_rates");
                for (JsonNode rateNode : roomRates) {
                    JsonNode roomRate = rateNode.path("room_rate");
                    String date = roomRate.path("date").asText();
                    int basicNightlyRate = roomRate.path("basic_nightly_rate").asInt();
                    date = date.split("T")[0];
                    if (date.compareTo(startDate) >= 0 && date.compareTo(endDate) <= 0
                            && (!minRatesMap.containsKey(date) || basicNightlyRate < minRatesMap.get(date))) {
                        minRatesMap.put(date, basicNightlyRate);
                    }
                }
            }

            StringBuilder filteredResponseBuilder = new StringBuilder("{");
            for (Map.Entry<String, Integer> entry : minRatesMap.entrySet()) {
                filteredResponseBuilder.append("\"").append(entry.getKey()).append("\": ").append(entry.getValue())
                        .append(", ");
            }
            if (!minRatesMap.isEmpty()) {
                filteredResponseBuilder.setLength(filteredResponseBuilder.length() - 2);
            }
            filteredResponseBuilder.append("}");

            return filteredResponseBuilder.toString();
        } catch (Exception e) {
            log.error("Error filtering minimum nightly rate: {}", e.getMessage());
            throw new CustomException("Error filtering minimum nightly rate");
        }
    }
}

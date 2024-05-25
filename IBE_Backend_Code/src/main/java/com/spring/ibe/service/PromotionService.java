package com.spring.ibe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.constants.Constants;
import com.spring.ibe.constants.GraphqlQuery;
import com.spring.ibe.dto.request.AddPromotionRequestDTO;
import com.spring.ibe.dto.request.PromotionRequestDTO;
import com.spring.ibe.dto.response.PromotionResponseDTO;
import com.spring.ibe.entity.Promotion;
import com.spring.ibe.exception.custom.FetchFailedException;
import com.spring.ibe.exception.custom.UnprocessableEntityException;
import com.spring.ibe.repository.PromotionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for handling promotions.
 */
@Service
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private static String graphqlUrl;
    private static String apiKey;
    private static final RestTemplate restTemplate = new RestTemplate();

    private static final String GET_PROMOTIONS = GraphqlQuery.GET_PROMOTIONS;

    /**
     * Constructor for PromotionService.
     *
     * @param graphqlUrl The URL for the GraphQL endpoint.
     * @param apiKey     The API key for accessing the GraphQL endpoint.
     */
    @Autowired
    public PromotionService(@Value("${app.graphql_url}") String graphqlUrl,
            @Value("${app.graphql_api_key}") String apiKey, PromotionRepository promotionRepository) {
        this.graphqlUrl = graphqlUrl;
        this.apiKey = apiKey;
        this.promotionRepository = promotionRepository;
    }

    /**
     * Retrieve promotions from the GraphQL endpoint.
     *
     * @param promotionRequestDTO The DTO containing promotion request details.
     * @return A DTO containing the promotions retrieved.
     */
    @Cacheable("promotions")
    public static PromotionResponseDTO getPromotions(PromotionRequestDTO promotionRequestDTO) {
        log.info("Retrieving promotions...");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(Constants.API_KEY_TITLE, apiKey);

        String requestBody = "{ \"query\": \"" + GET_PROMOTIONS + "\" }";

        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                String.class);
        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            String jsonResponse = responseEntity.getBody();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode promotionData = root.path("data").path("listPromotions");

                PromotionResponseDTO promotions = new PromotionResponseDTO();
                List<PromotionResponseDTO.Promotion> promotionList = new ArrayList<>();
                for (JsonNode promotionNode : promotionData) {
                    int promotionId = promotionNode.path("promotion_id").asInt();
                    PromotionResponseDTO.Promotion promotion = new PromotionResponseDTO.Promotion();
                    promotion.setDeactivated(promotionNode.path("is_deactivated").asBoolean());
                    promotion.setMinimumDaysOfStay(promotionNode.path("minimum_days_of_stay").asInt());
                    promotion.setPriceFactor(promotionNode.path("price_factor").asDouble());
                    promotion.setPromotionDescription(promotionNode.path("promotion_description").asText());
                    promotion.setPromotionId(promotionId);
                    promotion.setPromotionTitle(promotionNode.path("promotion_title").asText());

                    boolean isSeniorCitizen = promotionRequestDTO.getSeniorCitizen() && promotionId == 1;
                    boolean isMilitary = promotionRequestDTO.getMilitary() && promotionId == 4;
                    boolean isKduMembership = promotionRequestDTO.getKduMembership() && promotionId == 2;
                    boolean coversWeekend = coversWeekend(promotionRequestDTO.getStartDate(),
                            promotionRequestDTO.getEndDate()) && promotionId == 6;
                    boolean coversLongWeekend = coversLongWeekend(promotionRequestDTO.getStartDate(),
                            promotionRequestDTO.getEndDate()) && promotionId == 3;

                    if (isSeniorCitizen || isMilitary || isKduMembership) {
                        promotionList.add(promotion);
                    }
                    if (coversWeekend) {
                        promotionList.add(promotion);
                    }
                    if (coversLongWeekend) {
                        promotionList.add(promotion);
                    }
                    if (promotionId == 5) {
                        promotionList.add(promotion);
                    }
                }
                promotions.setPromotions(promotionList);
                log.info("Promotions retrieved successfully.");
                return promotions;
            } catch (IOException e) {
                log.error("Failed to parse promotions response: {}", e.getMessage());
                throw new FetchFailedException("Failed to parse promotions response.");
            }
        } else {
            log.error("Failed to retrieve promotions: Unexpected status code {}", responseEntity.getStatusCodeValue());
            throw new FetchFailedException("Failed to retrieve promotions.");
        }
    }

    /**
     * Checks if the date range covers a weekend.
     *
     * @param startDate The start date of the date range.
     * @param endDate   The end date of the date range.
     * @return True if the date range covers a weekend, false otherwise.
     */
    @Cacheable("coversWeekend")
    private static boolean coversWeekend(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        boolean hasSaturday = false;
        boolean hasSunday = false;

        while (!start.isAfter(end)) {
            if (start.getDayOfWeek() == DayOfWeek.SATURDAY) {
                hasSaturday = true;
            }
            if (start.getDayOfWeek() == DayOfWeek.SUNDAY) {
                hasSunday = true;
            }
            start = start.plusDays(1);
        }

        return hasSaturday && hasSunday;
    }

    /**
     * Checks if the date range covers a long weekend (3 or more days including a
     * weekend).
     */
    @Cacheable("coversLongWeekend")
    private static boolean coversLongWeekend(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        int days = (int) ChronoUnit.DAYS.between(start, end);

        return days >= 2 && coversWeekend(startDate, endDate);
    }

    /**
     * Adds a new promotion based on the provided request DTO.
     *
     * @param addPromotionRequestDTO The DTO containing the details of the promotion
     *                               to be added.
     * @throws UnprocessableEntityException if the promotion cannot be saved.
     */
    public void addPromotion(AddPromotionRequestDTO addPromotionRequestDTO) {
        try {
            promotionRepository
                    .save(new Promotion(addPromotionRequestDTO.getTitle(), addPromotionRequestDTO.getDescription(),
                            addPromotionRequestDTO.getPriceFactor(), addPromotionRequestDTO.isActive()));
            log.info("Promotion saved successfully.");
        } catch (Exception e) {
            log.error("Cannot save promotion. Please check the entity again: {}", e.getMessage());
            throw new UnprocessableEntityException("Cannot save promotion. Please check the entity again.");
        }
    }
}

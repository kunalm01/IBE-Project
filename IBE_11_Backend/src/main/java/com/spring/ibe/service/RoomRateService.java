package com.spring.ibe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.constants.Constants;
import com.spring.ibe.constants.GraphqlQuery;
import com.spring.ibe.dto.request.RoomRateRequestDTO;
import com.spring.ibe.dto.response.RoomAvailabilitiesResponseDTO;
import com.spring.ibe.dto.response.RoomRateResponseDTO;
import com.spring.ibe.dto.response.RoomRatesResponseDTO;
import com.spring.ibe.dto.response.RoomTypeRateResponseDTO;
import com.spring.ibe.exception.custom.FetchFailedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.*;

/**
 * Service class for managing room rate operations.
 */
@Service
@Slf4j
public class RoomRateService {

    private static String graphqlUrl = null;
    private static String apiKey = null;
    private static final RestTemplate restTemplate = new RestTemplate();

    public RoomRateService(@Value("${app.graphql_url}") String graphqlUrl,
            @Value("${app.graphql_api_key}") String apiKey) {
        this.graphqlUrl = graphqlUrl;
        this.apiKey = apiKey;
    }

    /**
     * Retrieves room availabilities within the specified date range and property.
     * 
     * @param startDate  The start date of the availability search.
     * @param endDate    The end date of the availability search.
     * @param propertyId The ID of the property.
     * @return The DTO containing room availabilities.
     * @throws FetchFailedException if the room availabilities cannot be fetched.
     */
    public static RoomAvailabilitiesResponseDTO getRoomAvailabilities(String startDate, String endDate,
            Integer propertyId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);
            String GET_ROOM_AVAILABILITIES = String.format(GraphqlQuery.GET_ROOM_AVAILABILITIES, startDate, endDate,
                    propertyId);

            String requestBody = "{ \"query\": \"" + GET_ROOM_AVAILABILITIES + "\" }";

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                log.info("Room availabilities fetched successfully.");
                String jsonResponse = responseEntity.getBody();
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode availabilitiesData = root.path("data").path("listRoomAvailabilities");
                    Map<Integer, Integer> roomTypeCountMap = new HashMap<>();
                    List<RoomAvailabilitiesResponseDTO.RoomAvailability> availabilities = new ArrayList<>();

                    for (JsonNode availabilityNode : availabilitiesData) {
                        RoomAvailabilitiesResponseDTO.RoomAvailability availability = new RoomAvailabilitiesResponseDTO.RoomAvailability();
                        availability.setDate(availabilityNode.path("date").asText());

                        JsonNode roomNode = availabilityNode.path("room");
                        RoomAvailabilitiesResponseDTO.Room room = new RoomAvailabilitiesResponseDTO.Room();
                        int roomId = roomNode.path("room_id").asInt();
                        room.setRoomId(roomId);

                        roomTypeCountMap.put(roomId, roomTypeCountMap.getOrDefault(roomId, 0) + 1);

                        RoomAvailabilitiesResponseDTO.RoomType roomType = new RoomAvailabilitiesResponseDTO.RoomType();
                        JsonNode roomTypeNode = roomNode.path("room_type");
                        roomType.setRoomTypeName(roomTypeNode.path("room_type_name").asText());

                        room.setRoomType(roomType);
                        availability.setRoom(room);
                        availabilities.add(availability);
                    }

                    List<Integer> availableRoomIds = new ArrayList<>();
                    int totalDates = calculateTotalDates(startDate, endDate);

                    for (Map.Entry<Integer, Integer> entry : roomTypeCountMap.entrySet()) {
                        if (entry.getValue() == totalDates) {
                            availableRoomIds.add(entry.getKey());
                        }
                    }

                    return getAvailableRoomTypes(availabilities, availableRoomIds);
                } catch (Exception e) {
                    log.error("Failed to parse room availabilities response.", e);
                    throw new FetchFailedException("Failed to parse room availabilities response.");
                }
            } else {
                log.error("Failed to fetch room availabilities. Please check the API again. Status code: {}",
                        responseEntity.getStatusCode());
                throw new FetchFailedException("Failed to fetch room availabilities. Please check the API again.");
            }
        } catch (Exception e) {
            log.error("Failed to fetch room availabilities.", e);
            throw e;
        }
    }

    @Cacheable("calculateTotalDates")
    private static int calculateTotalDates(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return (int) ChronoUnit.DAYS.between(start, end);
    }

    private static RoomAvailabilitiesResponseDTO getAvailableRoomTypes(
            List<RoomAvailabilitiesResponseDTO.RoomAvailability> availabilities, List<Integer> availableRoomIds) {
        try {
            List<RoomAvailabilitiesResponseDTO.RoomAvailability> availableAvailabilities = new ArrayList<>();

            for (RoomAvailabilitiesResponseDTO.RoomAvailability availability : availabilities) {
                if (availableRoomIds.contains(availability.getRoom().getRoomId())) {
                    availableAvailabilities.add(availability);
                }
            }

            log.info("Available room types filtered successfully.");
            return new RoomAvailabilitiesResponseDTO(availableAvailabilities);
        } catch (Exception e) {
            log.error("Error filtering available room types.", e);
            throw e;
        }
    }

    /**
     * Retrieves room rates within the specified date range and property.
     * 
     * @param startDate  The start date of the rate search.
     * @param endDate    The end date of the rate search.
     * @param propertyId The ID of the property.
     * @return The DTO containing room rates.
     * @throws FetchFailedException if the room rates cannot be fetched.
     */
    @Cacheable("getRoomRates")
    public static RoomRateResponseDTO getRoomRates(String startDate, String endDate, Integer propertyId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);
            String GET_ROOM_RATES = String.format(GraphqlQuery.GET_ROOM_RATES, startDate, endDate, propertyId);

            String requestBody = "{ \"query\": \"" + GET_ROOM_RATES + "\" }";

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode mappingsNode = root.path("data").path("listRoomRateRoomTypeMappings");
                    List<RoomRateResponseDTO.RoomRateRoomTypeMapping> roomRates = new ArrayList<>();
                    for (JsonNode mappingNode : mappingsNode) {
                        JsonNode roomRateNode = mappingNode.path("room_rate");
                        RoomRateResponseDTO.RoomRate roomRate = new RoomRateResponseDTO.RoomRate();
                        roomRate.setBasicNightlyRate(roomRateNode.path("basic_nightly_rate").asInt());
                        roomRate.setDate(roomRateNode.path("date").asText());

                        JsonNode roomTypeNode = mappingNode.path("room_type");
                        RoomRateResponseDTO.RoomType roomType = new RoomRateResponseDTO.RoomType();
                        roomType.setRoomTypeName(roomTypeNode.path("room_type_name").asText());

                        RoomRateResponseDTO.RoomRateRoomTypeMapping mapping = new RoomRateResponseDTO.RoomRateRoomTypeMapping();
                        mapping.setRoomRate(roomRate);
                        mapping.setRoomType(roomType);

                        roomRates.add(mapping);
                    }
                    log.info("Room rates fetched successfully.");
                    return new RoomRateResponseDTO(roomRates);
                } catch (Exception e) {
                    log.error("Failed to parse room rates response.", e);
                    throw new FetchFailedException("Failed to parse room rates response.");
                }
            } else {
                log.error("Failed to fetch room rates. Please check the API again. Status code: {}",
                        responseEntity.getStatusCode());
                throw new FetchFailedException("Failed to fetch room rates. Please check the API again.");
            }
        } catch (Exception e) {
            log.error("Failed to fetch room rates.", e);
            throw e;
        }
    }

    /**
     * Retrieves room rates with average minimum rates within the specified date
     * range and property.
     * 
     * @param startDate  The start date of the rate search.
     * @param endDate    The end date of the rate search.
     * @param propertyId The ID of the property.
     * @return The DTO containing room rates with average minimum rates.
     * @throws FetchFailedException if the room rates cannot be fetched.
     */
    public static RoomTypeRateResponseDTO getRoomRatesWithAverageMinimumRates(String startDate, String endDate,
            Integer propertyId) {
        try {
            Callable<List<RoomRateResponseDTO.RoomRateRoomTypeMapping>> roomRatesTask = () -> getRoomRates(startDate,
                    endDate, propertyId).getListRoomRateRoomTypeMappings();
            Callable<List<RoomAvailabilitiesResponseDTO.RoomAvailability>> roomAvailabilitiesTask = () -> getRoomAvailabilities(
                    startDate, endDate, propertyId).getListRoomAvailabilities();

            ExecutorService executorService = Executors.newFixedThreadPool(2);
            Future<List<RoomRateResponseDTO.RoomRateRoomTypeMapping>> roomRatesFuture = executorService
                    .submit(roomRatesTask);
            Future<List<RoomAvailabilitiesResponseDTO.RoomAvailability>> roomAvailabilitiesFuture = executorService
                    .submit(roomAvailabilitiesTask);

            List<RoomRateResponseDTO.RoomRateRoomTypeMapping> roomRates = roomRatesFuture.get();
            List<RoomAvailabilitiesResponseDTO.RoomAvailability> roomAvailabilities = roomAvailabilitiesFuture.get();

            Callable<Map<String, Double>> averageRatesTask = () -> calculateAverageRates(roomRates);
            Callable<Map<String, Integer>> availabilityTask = () -> calculateRoomAvailability(roomAvailabilities);

            Future<Map<String, Double>> averageRatesFuture = executorService.submit(averageRatesTask);
            Future<Map<String, Integer>> availabilityFuture = executorService.submit(availabilityTask);

            Map<String, Double> roomTypeAverageRates = averageRatesFuture.get();
            Map<String, Integer> roomTypeAvailability = availabilityFuture.get();

            executorService.shutdown();

            log.info("Room rates with average minimum rates fetched successfully.");
            return new RoomTypeRateResponseDTO(roomTypeAverageRates, roomTypeAvailability);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Failed to fetch room rates and availabilities", e);
            throw new FetchFailedException("Failed to fetch room rates and availabilities");
        }
    }

    /**
     * Retrieves room rates with rates based on the provided room rate request DTO.
     *
     * @param roomRateRequestDTO The DTO containing the room rate request details.
     * @return The response DTO containing the room rates with rates.
     * @throws FetchFailedException If an error occurs while fetching room rates.
     */
    @Cacheable("roomRatesWithRates")
    public static RoomRatesResponseDTO getRoomRatesWithRates(RoomRateRequestDTO roomRateRequestDTO) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);
            String GET_RATES_ROOM_TYPE = String.format(GraphqlQuery.GET_RATES_ROOM_TYPE,
                    roomRateRequestDTO.getStartDate(), roomRateRequestDTO.getEndDate(),
                    roomRateRequestDTO.getRoomTypeId(), roomRateRequestDTO.getPropertyId());

            String requestBody = "{ \"query\": \"" + GET_RATES_ROOM_TYPE + "\" }";

            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode mappingsNode = root.path("data").path("listRoomRateRoomTypeMappings");
                    List<RoomRatesResponseDTO.RoomRate> roomRates = new ArrayList<>();
                    for (JsonNode mappingNode : mappingsNode) {
                        JsonNode roomRateNode = mappingNode.path("room_rate");
                        RoomRatesResponseDTO.RoomRate roomRate = new RoomRatesResponseDTO.RoomRate();
                        roomRate.setRate(roomRateNode.path("basic_nightly_rate").asInt());
                        roomRate.setDate(roomRateNode.path("date").asText());

                        roomRates.add(roomRate);
                    }
                    log.info("Room rates with rates fetched successfully.");
                    return new RoomRatesResponseDTO(roomRates);
                } catch (Exception e) {
                    log.error("Failed to parse room rates response.", e);
                    throw new FetchFailedException("Failed to parse room rates response.");
                }
            } else {
                log.error("Failed to fetch room rates. Please check the API again. Status code: {}",
                        responseEntity.getStatusCode());
                throw new FetchFailedException("Failed to fetch room rates. Please check the API again.");
            }
        } catch (Exception e) {
            log.error("Failed to fetch room rates.", e);
            throw e;
        }
    }

    private static Map<String, Double> calculateAverageRates(
            List<RoomRateResponseDTO.RoomRateRoomTypeMapping> roomRates) {
        try {
            Map<String, List<Integer>> roomTypeToRates = new HashMap<>();
            for (RoomRateResponseDTO.RoomRateRoomTypeMapping mapping : roomRates) {
                String roomType = mapping.getRoomType().getRoomTypeName();
                int rate = mapping.getRoomRate().getBasicNightlyRate();
                if (roomTypeToRates.containsKey(roomType)) {
                    roomTypeToRates.get(roomType).add(rate);
                } else {
                    List<Integer> rates = new ArrayList<>();
                    rates.add(rate);
                    roomTypeToRates.put(roomType, rates);
                }
            }

            Map<String, Double> roomTypeAverageRates = new HashMap<>();
            for (Map.Entry<String, List<Integer>> entry : roomTypeToRates.entrySet()) {
                List<Integer> rates = entry.getValue();
                double averageRate = rates.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                roomTypeAverageRates.put(entry.getKey(), averageRate);
            }
            log.info("Average rates calculated successfully.");
            return roomTypeAverageRates;
        } catch (Exception e) {
            log.error("Failed to calculate average rates.", e);
            throw e;
        }
    }

    private static Map<String, Integer> calculateRoomAvailability(
            List<RoomAvailabilitiesResponseDTO.RoomAvailability> roomAvailabilities) {
        try {
            Map<String, Integer> roomTypeAvailability = new HashMap<>();
            Set<Integer> processedRoomIds = new HashSet<>();

            for (RoomAvailabilitiesResponseDTO.RoomAvailability availability : roomAvailabilities) {
                int roomId = availability.getRoom().getRoomId();
                if (processedRoomIds.contains(roomId)) {
                    continue;
                }

                String roomType = availability.getRoom().getRoomType().getRoomTypeName();
                roomTypeAvailability.put(roomType, roomTypeAvailability.getOrDefault(roomType, 0) + 1);

                processedRoomIds.add(roomId);
            }
            log.info("Room availability calculated successfully.");
            return roomTypeAvailability;
        } catch (Exception e) {
            log.error("Failed to calculate room availability.", e);
            throw e;
        }
    }

}
package com.spring.ibe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.constants.Constants;
import com.spring.ibe.constants.GraphqlQuery;
import com.spring.ibe.dto.request.RoomIdRequestDTO;
import com.spring.ibe.dto.request.RoomRequestDTO;
import com.spring.ibe.dto.response.RoomIdResponseDTO;
import com.spring.ibe.dto.response.RoomResponseDTO;
import com.spring.ibe.dto.response.RoomTypeRateResponseDTO;
import com.spring.ibe.exception.custom.FetchFailedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/**
 * Service class to handle room-related operations.
 */
@Service
@Slf4j
public class RoomService {
    private final String graphqlUrl;
    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Constructor for RoomService.
     *
     * @param graphqlUrl The URL for the GraphQL endpoint.
     * @param apiKey     The API key for accessing the GraphQL endpoint.
     */
    public RoomService(@Value("${app.graphql_url}") String graphqlUrl, @Value("${app.graphql_api_key}") String apiKey) {
        this.graphqlUrl = graphqlUrl;
        this.apiKey = apiKey;
    }

    /**
     * Retrieves rooms from the GraphQL endpoint.
     *
     * @param roomRequestDTO The request DTO containing room search criteria.
     * @param pageNumber     The page number for pagination.
     * @param pageSize       The size of each page for pagination.
     * @return The DTO containing the retrieved rooms.
     * @throws FetchFailedException if the rooms cannot be fetched.
     */
    public RoomResponseDTO getRooms(RoomRequestDTO roomRequestDTO, Integer pageNumber, Integer pageSize) {
        try {
            String startDate = roomRequestDTO.getStartDate();
            String endDate = roomRequestDTO.getEndDate();
            Integer propertyId = roomRequestDTO.getPropertyId();
            String roomName = roomRequestDTO.getRoomTypeName();
            Integer singleBed = roomRequestDTO.getSingleBed();
            Integer doubleBed = roomRequestDTO.getDoubleBed();
            Integer area = roomRequestDTO.getArea();
            Integer minCapacity = roomRequestDTO.getMinCapacity();

            ExecutorService executorService = Executors.newFixedThreadPool(2);

            Future<RoomTypeRateResponseDTO> roomDetailsFuture = executorService
                    .submit(() -> RoomRateService.getRoomRatesWithAverageMinimumRates(startDate, endDate, propertyId));

            Future<ResponseEntity<String>> responseEntityFuture = executorService.submit(() -> {
                String GET_ROOMS = String.format(GraphqlQuery.GET_ROOMS, propertyId, roomName, singleBed, area,
                        doubleBed, minCapacity);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set(Constants.API_KEY_TITLE, apiKey);
                String requestBody = "{ \"query\": \"" + GET_ROOMS + "\" }";
                HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
                return restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity, String.class);
            });

            RoomTypeRateResponseDTO roomDetails = roomDetailsFuture.get();
            ResponseEntity<String> responseEntity = responseEntityFuture.get();

            Map<String, Double> roomTypeRates = roomDetails.getRoomTypeRates();
            Map<String, Integer> roomTypeCount = roomDetails.getRoomTypeAvailability();

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode roomData = root.path("data").path("listRoomTypes");
                    List<RoomResponseDTO.Room> rooms = new ArrayList<>();
                    for (JsonNode roomNode : roomData) {
                        RoomResponseDTO.Room room = new RoomResponseDTO.Room();
                        room.setAreaInSquareFeet(roomNode.path("area_in_square_feet").asInt());
                        room.setDoubleBed(roomNode.path("double_bed").asInt());
                        room.setMaxCapacity(roomNode.path("max_capacity").asInt());
                        room.setSingleBed(roomNode.path("single_bed").asInt());
                        room.setRoomTypeName(roomNode.path("room_type_name").asText());
                        room.setRoomTypeId(roomNode.path("room_type_id").asInt());

                        String roomTypeName = room.getRoomTypeName();
                        Double price = roomTypeRates.get(roomTypeName);
                        int roomCount = 0;
                        if (roomTypeCount.containsKey(roomTypeName)) {
                            roomCount = roomTypeCount.get(roomTypeName);
                        }
                        room.setPrice(price);
                        room.setAvailableRooms(roomCount);
                        if (matchFilters(room, roomRequestDTO)) {
                            rooms.add(room);
                        }
                    }
                    if (roomRequestDTO.getSort().length() > 6) {
                        switch (roomRequestDTO.getSort()) {
                            case "Price Asc":
                                rooms.sort((room1, room2) -> Double.compare(room1.getPrice(), room2.getPrice()));
                                break;
                            case "Price Desc":
                                rooms.sort((room1, room2) -> Double.compare(room2.getPrice(), room1.getPrice()));
                                break;
                            case "Name Asc":
                                rooms.sort(
                                        (room1, room2) -> room1.getRoomTypeName().compareTo(room2.getRoomTypeName()));
                                break;
                            case "Name Desc":
                                rooms.sort(
                                        (room1, room2) -> room2.getRoomTypeName().compareTo(room1.getRoomTypeName()));
                                break;
                            default:
                                break;
                        }
                    }
                    int startIndex = (pageNumber - 1) * pageSize;
                    int endIndex = Math.min(startIndex + pageSize, rooms.size());
                    executorService.shutdown();
                    log.info("Rooms fetched successfully.");
                    return new RoomResponseDTO(rooms.subList(startIndex, endIndex), rooms.size());
                } catch (Exception e) {
                    log.error("Failed to parse rooms response.", e);
                    throw new FetchFailedException("Failed to parse rooms response.");
                }
            } else {
                executorService.shutdown();
                log.error("Failed to fetch rooms. Please check the API again. Status code: {}",
                        responseEntity.getStatusCode());
                throw new FetchFailedException("Failed to fetch rooms. Please check the API again.");
            }
        } catch (InterruptedException | ExecutionException e) {
            log.error("Failed to fetch room details.", e);
            throw new FetchFailedException("Failed to fetch room details.");
        }
    }

    /**
     * Retrieves room IDs based on the provided room ID request DTO.
     *
     * @param roomIdRequestDTO The DTO containing room ID request details.
     * @return The DTO containing the retrieved room IDs.
     * @throws FetchFailedException if the room IDs cannot be fetched.
     */
    public RoomIdResponseDTO getRoomIds(RoomIdRequestDTO roomIdRequestDTO) {
        try {
            String startDate = roomIdRequestDTO.getStartDate();
            String endDate = roomIdRequestDTO.getEndDate();
            Long roomTypeId = roomIdRequestDTO.getRoomTypeId();
            Long propertyId = roomIdRequestDTO.getPropertyId();
            Long roomCount = roomIdRequestDTO.getRoomCount();

            String GET_ROOM_IDS = String.format(GraphqlQuery.GET_ROOM_IDS, startDate, endDate, roomTypeId, propertyId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);
            String requestBody = "{ \"query\": \"" + GET_ROOM_IDS + "\" }";
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                ObjectMapper objectMapper = new ObjectMapper();
                try {
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode roomIdData = root.path("data").path("listRoomAvailabilities");

                    Map<Integer, Integer> roomIdCountMap = new HashMap<>();

                    for (JsonNode roomNode : roomIdData) {
                        int roomId = roomNode.path("room_id").asInt();
                        roomIdCountMap.put(roomId, roomIdCountMap.getOrDefault(roomId, 0) + 1);
                    }

                    List<Integer> roomIds = new ArrayList<>();

                    LocalDate start = LocalDate.parse(startDate);
                    LocalDate end = LocalDate.parse(endDate);
                    long numberOfDays = ChronoUnit.DAYS.between(start, end);

                    for (Map.Entry<Integer, Integer> entry : roomIdCountMap.entrySet()) {
                        int roomId = entry.getKey();
                        int count = entry.getValue();

                        if (count >= numberOfDays) {
                            roomIds.add(roomId);
                        }
                    }

                    if (roomIds.size() < roomCount) {
                        log.info("Insufficient room IDs found for the given criteria. Returning an empty list.");
                        return new RoomIdResponseDTO(new ArrayList<>());
                    }

                    log.info("Successfully fetched room IDs.");
                    return new RoomIdResponseDTO(roomIds);
                } catch (Exception e) {
                    log.error("Failed to parse rooms' ids response.", e);
                    throw new FetchFailedException("Failed to parse rooms' ids response.");
                }
            } else {
                log.error("Failed to fetch rooms' ids. Please check the API again. Status code: {}",
                        responseEntity.getStatusCode());
                throw new FetchFailedException("Failed to fetch rooms' ids. Please check the API again.");
            }
        } catch (Exception e) {
            log.error("Failed to fetch room ids.", e);
            throw new FetchFailedException("Failed to fetch room ids.");
        }
    }

    /**
     * Checks if a room matches the search filters specified in the room request
     * DTO.
     * 
     * @param room           The room to be checked.
     * @param roomRequestDTO The DTO containing room search criteria.
     * @return true if the room matches the filters, false otherwise.
     */
    private boolean matchFilters(RoomResponseDTO.Room room, RoomRequestDTO roomRequestDTO) {
        try {
            int totalCounts = roomRequestDTO.getTotalCounts();
            int totalRoomsSelected = roomRequestDTO.getTotalRoomsSelected();
            int totalBedsSelected = roomRequestDTO.getTotalBedsSelected();
            int totalBedsInRoom = room.getSingleBed() + room.getDoubleBed() * 2;

            if (roomRequestDTO.getMaxPrice() != 0 && room.getPrice() > roomRequestDTO.getMaxPrice()) {
                log.info("Room price {} exceeds the maximum allowed price {}", room.getPrice(),
                        roomRequestDTO.getMaxPrice());
                return false;
            }
            if (totalRoomsSelected * room.getMaxCapacity() < totalCounts) {
                log.info("Total capacity of selected rooms {} is less than required total counts {}",
                        totalRoomsSelected * room.getMaxCapacity(), totalCounts);
                return false;
            }
            if (totalRoomsSelected > room.getAvailableRooms()) {
                log.info("Total selected rooms {} exceeds available rooms {}", totalRoomsSelected,
                        room.getAvailableRooms());
                return false;
            }
            if (totalBedsSelected > totalBedsInRoom) {
                log.info("Total selected beds {} exceed beds available in room {}", totalBedsSelected, totalBedsInRoom);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.error("An error occurred while filtering rooms.", e);
            throw new RuntimeException("An error occurred while filtering rooms.");
        }
    }

}

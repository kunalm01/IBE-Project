package com.spring.ibe.controller;

import com.spring.ibe.dto.request.PromotionRequestDTO;
import com.spring.ibe.dto.request.RoomDataRequestDTO;
import com.spring.ibe.dto.response.RoomDataResponseDTO;
import com.spring.ibe.dto.response.RoomPromoResponseDTO;
import com.spring.ibe.dto.response.RoomReviewResponseDTO;
import com.spring.ibe.service.RoomDataService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling endpoints related to room data management.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class RoomDataController {
    private final RoomDataService roomDataService;

    @Autowired
    public RoomDataController(RoomDataService roomDataService) {
        this.roomDataService = roomDataService;
    }

    /**
     * POST endpoint to save room data details.
     *
     * @param roomDataRequestDTO The DTO containing the room data details to be
     *                           saved.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/room-data")
    public ResponseEntity<String> postRoomDataDetails(@Valid @RequestBody RoomDataRequestDTO roomDataRequestDTO) {
        log.info("Received request to save room data details");
        roomDataService.saveRoomData(roomDataRequestDTO);
        log.info("Room data details saved successfully");
        return ResponseEntity.ok("Room Data saved successfully");
    }

    /**
     * POST endpoint to retrieve room data by ID along with promotions.
     *
     * @param tenantId            The ID of the tenant.
     * @param roomTypeId          The ID of the room data to retrieve.
     * @param promotionRequestDTO The DTO containing promotion-related parameters.
     * @return ResponseEntity containing the room data and promotions.
     */
    @PostMapping("/room-data/{tenantId}/{roomTypeId}")
    public ResponseEntity<RoomDataResponseDTO> getRoomDataById(@Valid @PathVariable long tenantId,
            @Valid @PathVariable long roomTypeId, @Valid @RequestBody PromotionRequestDTO promotionRequestDTO) {
        log.info("Received request to retrieve room data by ID with promotions");
        RoomDataResponseDTO responseDTO = roomDataService.getRoomDataById(tenantId, roomTypeId, promotionRequestDTO);
        log.info("Retrieved room data by ID with promotions successfully");
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * POST endpoint to post a review for a room by ID.
     *
     * @param tenantId   The ID of the tenant.
     * @param roomTypeId The ID of the room data to retrieve.
     * @param reviewDTO  The DTO containing the review details.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/room-review/{tenantId}/{roomTypeId}")
    public ResponseEntity<String> postReviewByRoomId(@Valid @PathVariable long tenantId,
            @Valid @PathVariable long roomTypeId, @Valid @RequestParam String username,
            @Valid @RequestBody RoomDataRequestDTO.ReviewDTO reviewDTO) {
        log.info("Received request to post a review for a room by ID");
        roomDataService.postReviewByRoomId(tenantId, roomTypeId, username, reviewDTO);
        log.info("Review posted successfully");
        return ResponseEntity.ok("Review posted successfully");
    }

    @GetMapping("/room-review/{tenantId}/{roomTypeId}")
    public ResponseEntity<RoomReviewResponseDTO> getReviewByRoomId(@Valid @PathVariable long tenantId,
            @Valid @PathVariable long roomTypeId) {
        log.info("Received request to retrieve review for a room by ID");
        RoomReviewResponseDTO responseDTO = roomDataService.getReviewByRoomId(tenantId, roomTypeId);
        log.info("Retrieved review for a room by ID successfully");
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * GET endpoint to retrieve promotion details for a room by ID and input promo
     * code.
     *
     * @param roomTypeId     The ID of the room for which promotion details are
     *                       retrieved.
     * @param inputPromoCode The input promo code.
     * @return ResponseEntity containing the promotion details for the specified
     *         room.
     */
    @GetMapping("/room-promocode")
    public ResponseEntity<RoomPromoResponseDTO> getPromoDetailsByRoomId(@Valid @RequestParam long tenantId,
            @Valid @RequestParam long roomTypeId, @Valid @RequestParam String inputPromoCode) {
        log.info("Received request to retrieve promotion details for a room by ID and input promo code");
        RoomPromoResponseDTO responseDTO = roomDataService.getPromoDetailsByRoomId(tenantId, roomTypeId,
                inputPromoCode);
        log.info("Retrieved promotion details for a room by ID and input promo code successfully");
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * PUT endpoint to update room data details by ID.
     *
     * @param roomTypeId         The ID of the room data to update.
     * @param roomDataRequestDTO The DTO containing the updated room data details.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PutMapping("/room-data/{tenantId}/{roomTypeId}")
    public ResponseEntity<String> updateRoomData(@Valid @PathVariable long tenantId,
            @Valid @PathVariable long roomTypeId, @Valid @RequestBody RoomDataRequestDTO roomDataRequestDTO) {
        log.info("Received request to update room data details by ID");
        roomDataService.updateRoomData(tenantId, roomTypeId, roomDataRequestDTO);
        log.info("Updated room data details by ID successfully");
        return ResponseEntity.ok("Data updated successfully");
    }
}

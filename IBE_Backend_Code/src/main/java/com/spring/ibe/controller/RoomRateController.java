package com.spring.ibe.controller;

import com.spring.ibe.dto.response.RoomRatesResponseDTO;
import com.spring.ibe.dto.request.RoomRateRequestDTO;
import com.spring.ibe.service.RoomRateService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling endpoints related to room rates.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class RoomRateController {
    private final RoomRateService roomRateService;

    @Autowired
    public RoomRateController(RoomRateService roomRateService) {
        this.roomRateService = roomRateService;
    }

    /**
     * POST endpoint to retrieve room rates with rate breakdown based on the
     * provided request parameters.
     *
     * @param roomRateRequestDTO The DTO containing the request parameters for room
     *                           rates.
     * @return ResponseEntity containing the room rates with rate breakdown.
     */
    @PostMapping("/rate-breakdown")
    public ResponseEntity<RoomRatesResponseDTO> getRoomRatesWithRates(
            @Valid @RequestBody RoomRateRequestDTO roomRateRequestDTO) {
        log.info("Received request to get room rates with rates breakdown");
        RoomRatesResponseDTO responseDTO = roomRateService.getRoomRatesWithRates(roomRateRequestDTO);
        log.info("Retrieved room rates with rates breakdown successfully");
        return ResponseEntity.ok(responseDTO);
    }
}

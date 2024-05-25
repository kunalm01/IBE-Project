package com.spring.ibe.controller;

import com.spring.ibe.dto.request.RoomIdRequestDTO;
import com.spring.ibe.dto.request.RoomRequestDTO;
import com.spring.ibe.dto.response.RoomIdResponseDTO;
import com.spring.ibe.dto.response.RoomResponseDTO;
import com.spring.ibe.service.RoomService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling endpoints related to rooms.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class RoomController {

    private final RoomService roomService;

    @Autowired
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * POST endpoint to retrieve rooms based on the provided request parameters.
     *
     * @param roomRequestDTO The DTO containing the request parameters for rooms.
     * @param pageNumber     The page number for pagination.
     * @param pageSize       The size of each page for pagination.
     * @return ResponseEntity containing the rooms.
     */
    @PostMapping("/room")
    public ResponseEntity<RoomResponseDTO> getRooms(@Valid @RequestBody RoomRequestDTO roomRequestDTO,
            @Valid @RequestParam Integer pageNumber,
            @Valid @RequestParam Integer pageSize) {
        log.info("Received request to retrieve rooms");
        RoomResponseDTO responseDTO = roomService.getRooms(roomRequestDTO, pageNumber, pageSize);
        log.info("Retrieved rooms successfully");
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * POST endpoint to retrieve room IDs based on the provided request parameters.
     *
     * @param roomIdRequestDTO The DTO containing the request parameters for room
     *                         IDs.
     * @return ResponseEntity containing the room IDs.
     */
    @PostMapping("/room-ids")
    public ResponseEntity<RoomIdResponseDTO> getRoomIds(@Valid @RequestBody RoomIdRequestDTO roomIdRequestDTO) {
        log.info("Received request to retrieve room IDs");
        RoomIdResponseDTO responseDTO = roomService.getRoomIds(roomIdRequestDTO);
        log.info("Retrieved room IDs successfully");
        return ResponseEntity.ok(responseDTO);
    }
}

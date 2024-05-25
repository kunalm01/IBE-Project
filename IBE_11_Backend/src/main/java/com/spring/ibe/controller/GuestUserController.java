package com.spring.ibe.controller;

import com.spring.ibe.dto.request.GuestUserRequestDTO;
import com.spring.ibe.service.GuestUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling tenant-related endpoints.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class GuestUserController {

    private final GuestUserService guestUserService;

    public GuestUserController(GuestUserService guestUserService) {
        this.guestUserService = guestUserService;
    }

    @PutMapping("/user")
    public ResponseEntity<String> updateGuestUser(@RequestBody GuestUserRequestDTO guestUserRequestDTO) {
        log.info("Received request to update user: {}", guestUserRequestDTO);
        guestUserService.updateUser(guestUserRequestDTO);
        log.info("User updated successfully");
        return ResponseEntity.ok("User updated successfully");

    }
}

package com.spring.ibe.controller;

import com.spring.ibe.dto.request.ConfigRequestDTO;
import com.spring.ibe.service.ConfigService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling configuration-related endpoints.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class ConfigController {

    private final ConfigService configService;

    @Autowired
    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    /**
     * POST endpoint to save a new configuration.
     *
     * @param configRequestDTO The request body containing the configuration data.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/config")
    public ResponseEntity<String> postConfig(@Valid @RequestBody ConfigRequestDTO configRequestDTO) {
        log.info("Received request to save config: {}", configRequestDTO);
        configService.saveConfig(configRequestDTO);
        log.info("Config saved successfully");
        return ResponseEntity.ok("Config saved successfully");
    }

    /**
     * GET endpoint to retrieve a configuration by ID.
     *
     * @param tenantId The ID of the configuration to retrieve.
     * @return ResponseEntity containing the retrieved configuration.
     */
    @GetMapping("/config/{tenantId}")
    public ResponseEntity<ConfigRequestDTO> getConfig(@Valid @PathVariable long tenantId) {
        log.info("Received request to retrieve config with ID: {}", tenantId);
        ConfigRequestDTO configRequestDTO = configService.getConfig(tenantId);
        log.info("Retrieved config: {}", configRequestDTO);
        return ResponseEntity.ok(configRequestDTO);
    }

    /**
     * PUT endpoint to update an existing configuration.
     *
     * @param tenantId         The ID of the configuration to update.
     * @param configRequestDTO The request body containing the updated configuration
     *                         data.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PutMapping("/config/{tenantId}")
    public ResponseEntity<String> updateConfig(@Valid @PathVariable long tenantId,
            @Valid @RequestBody ConfigRequestDTO configRequestDTO) {
        log.info("Received request to update config with ID: {}", tenantId);
        configService.updateConfig(tenantId, configRequestDTO);
        log.info("Config updated successfully");
        return ResponseEntity.ok("Config updated successfully");
    }
}

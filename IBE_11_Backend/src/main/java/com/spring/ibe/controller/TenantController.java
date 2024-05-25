package com.spring.ibe.controller;

import com.spring.ibe.dto.request.TenantRequestDTO;
import com.spring.ibe.service.TenantService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling tenant-related endpoints.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class TenantController {

    private final TenantService tenantService;

    @Autowired
    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
     * POST endpoint to save a new tenant.
     *
     * @param tenantRequestDTO The request body containing the tenant data.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/tenant")
    public ResponseEntity<String> postConfig(@Valid @RequestBody TenantRequestDTO tenantRequestDTO) {
        log.info("Received request to save tenant: {}", tenantRequestDTO);
        tenantService.saveTenant(tenantRequestDTO);
        log.info("Tenant saved successfully");
        return ResponseEntity.ok("Tenant saved successfully");
    }
}


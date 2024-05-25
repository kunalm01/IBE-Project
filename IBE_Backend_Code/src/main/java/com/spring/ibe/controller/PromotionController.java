package com.spring.ibe.controller;

import com.spring.ibe.dto.request.AddPromotionRequestDTO;
import com.spring.ibe.dto.request.PromotionRequestDTO;
import com.spring.ibe.dto.response.PromotionResponseDTO;
import com.spring.ibe.service.PromotionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling endpoints related to promotions.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class PromotionController {

    private final PromotionService promotionService;

    @Autowired
    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    /**
     * POST endpoint to retrieve promotions based on the provided request.
     *
     * @param promotionRequestDTO The DTO containing the request parameters for
     *                            promotions.
     * @return ResponseEntity containing the promotions.
     */
    @PostMapping("/promotion")
    public ResponseEntity<PromotionResponseDTO> getPromotions(
            @Valid @RequestBody PromotionRequestDTO promotionRequestDTO) {
        log.info("Received request to retrieve promotions");
        PromotionResponseDTO responseDTO = promotionService.getPromotions(promotionRequestDTO);
        log.info("Retrieved promotions successfully");
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * POST endpoint to add a new promotion.
     *
     * @param addPromotionRequestDTO The DTO containing details for adding a
     *                               promotion.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/add-promotion")
    public ResponseEntity<String> addPromotion(@Valid @RequestBody AddPromotionRequestDTO addPromotionRequestDTO) {
        log.info("Received request to add promotion: {}", addPromotionRequestDTO.getTitle());
        promotionService.addPromotion(addPromotionRequestDTO);
        log.info("Promotion added successfully");
        return ResponseEntity.ok("Promotion added successfully");
    }
}
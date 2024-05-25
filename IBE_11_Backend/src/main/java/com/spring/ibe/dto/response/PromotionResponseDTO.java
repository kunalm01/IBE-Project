package com.spring.ibe.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO class for promotion details.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionResponseDTO {
    @JsonProperty("promotions")
    private List<Promotion> promotions;

    /**
     * Inner class representing promotion details.
     */
    @Data
    public static class Promotion {
        private boolean isDeactivated;
        private int minimumDaysOfStay;
        private double priceFactor;
        private String promotionDescription;
        private int promotionId;
        private String promotionTitle;
    }
}

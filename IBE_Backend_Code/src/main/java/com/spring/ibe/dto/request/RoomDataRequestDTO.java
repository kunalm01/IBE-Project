package com.spring.ibe.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Request DTO class for room data.
 */
@Data
public class RoomDataRequestDTO {
    @NotNull
    @JsonProperty("tenant_id")
    private long tenantId;

    @NotNull
    @JsonProperty("room_type_id")
    private long roomTypeId;

    @JsonProperty("image_urls")
    private List<String> imageUrls;

    @JsonProperty("room_reviews")
    private Map<String, ReviewDTO> roomReviews;

    @JsonProperty("room_amenities")
    private List<String> roomAmenities;

    @JsonProperty("room_description")
    private String roomDescription;

    @JsonProperty("promo_codes")
    private List<String> promoCodes;

    @Data
    public static class ReviewDTO {
        @JsonProperty("rating")
        private int rating;

        @JsonProperty("review")
        private String review;
    }
}

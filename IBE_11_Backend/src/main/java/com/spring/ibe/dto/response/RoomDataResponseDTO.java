package com.spring.ibe.dto.response;

import lombok.Data;
import java.util.List;

/**
 * DTO class representing room data response.
 */
@Data
public class RoomDataResponseDTO {
    private List<String> roomImages;
    private double rating;
    private long totalReviews;
    private PromotionResponseDTO.Promotion bestPromotion;
    private String roomDescription;
    private List<String> roomAmenities;
}

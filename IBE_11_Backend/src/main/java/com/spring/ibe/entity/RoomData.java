package com.spring.ibe.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.spring.ibe.dto.request.RoomDataRequestDTO;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Entity class representing room data.
 */
@Data
@Entity
@Table(name = "room_data")
@IdClass(RoomDataId.class)
public class RoomData {
    @Id
    private long tenantId;

    @Id
    private long roomTypeId;

    @Column(columnDefinition = "TEXT")
    private RoomData.InnerRoomData roomData;

    /**
     * Inner class representing room data details.
     */
    @Data
    public static class InnerRoomData {
        @JsonProperty("image_urls")
        private List<String> imageUrls;

        @JsonProperty("room_reviews")
        private Map<String, RoomDataRequestDTO.ReviewDTO> roomReviews;

        @JsonProperty("rating")
        private double rating;

        @JsonProperty("room_description")
        private String roomDescription;

        @JsonProperty("room_amenities")
        private List<String> roomAmenities;

        @JsonProperty("promo_codes")
        private List<String> promoCodes;
    }
}

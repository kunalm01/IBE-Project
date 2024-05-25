package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomReviewResponseDTO {
    List<RoomReviewDTO> roomReviews;

    @Data
    public static class RoomReviewDTO {
        private String username;
        private String review;
        private int rating;
    }
}

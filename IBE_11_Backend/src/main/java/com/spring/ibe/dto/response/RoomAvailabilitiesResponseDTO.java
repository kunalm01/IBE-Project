package com.spring.ibe.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO class representing room availabilities response.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomAvailabilitiesResponseDTO {
    @JsonProperty("listRoomAvailabilities")
    private List<RoomAvailability> listRoomAvailabilities;

    /**
     * Represents room availability information.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomAvailability {
        private String date;
        private Room room;
    }

    /**
     * Represents room details.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Room {
        private int roomId;
        private RoomType roomType;
    }

    /**
     * Represents room type details.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomType {
        private String roomTypeName;
    }
}

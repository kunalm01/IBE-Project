package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO class representing room response.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponseDTO {
    private List<Room> listRooms;

    private int totalRecords;

    /**
     * DTO class representing room details.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Room {
        private Double price;

        private int availableRooms;

        private int areaInSquareFeet;

        private int doubleBed;

        private int maxCapacity;

        private int singleBed;

        private String roomTypeName;

        private int roomTypeId;
    }
}

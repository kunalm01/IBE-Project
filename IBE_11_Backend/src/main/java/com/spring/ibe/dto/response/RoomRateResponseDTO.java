package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO class representing room rate response.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRateResponseDTO {
    private List<RoomRateRoomTypeMapping> listRoomRateRoomTypeMappings;

    /**
     * DTO class representing room rate and room type mapping.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomRateRoomTypeMapping {
        private RoomRate roomRate;

        private RoomType roomType;
    }

    /**
     * DTO class representing room rate.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomRate {
        private int basicNightlyRate;

        private String date;
    }

    /**
     * DTO class representing room type.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomType {
        private String roomTypeName;
    }
}

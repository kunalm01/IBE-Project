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
public class RoomRatesResponseDTO {
    private List<RoomRate> roomRateList;

    /**
     * DTO class representing room rate.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoomRate {
        private int rate;

        private String date;
    }
}

package com.spring.ibe.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyBookingsResponseDTO {
    List<MyBookingsDTO> myBookings;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MyBookingsDTO {
        private Long bookingId;
        private boolean active;
        private String startDate;
        private String endDate;
        private Long roomCount;
        private String roomName;
    }
}

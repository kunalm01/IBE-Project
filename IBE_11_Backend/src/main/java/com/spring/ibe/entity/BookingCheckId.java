package com.spring.ibe.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingCheckId implements Serializable {
    private Long tenantId;
    private Long propertyId;
    private Long roomTypeId;
    private Long roomId;
    private LocalDate startDate;
    private LocalDate endDate;
}

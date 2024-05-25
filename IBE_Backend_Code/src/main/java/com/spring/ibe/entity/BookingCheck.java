package com.spring.ibe.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "booking_check")
@IdClass(BookingCheckId.class)
public class BookingCheck {
    @Id
    @Column(name = "tenant_id")
    private Long tenantId;
    @Id
    @Column(name = "property_id")
    private Long propertyId;
    @Id
    @Column(name = "room_type_id")
    private Long roomTypeId;
    @Id
    @Column(name = "room_id")
    private Long roomId;
    @Id
    @Column(name = "start_date")
    private LocalDate startDate;
    @Id
    @Column(name = "end_date")
    private LocalDate endDate;
}

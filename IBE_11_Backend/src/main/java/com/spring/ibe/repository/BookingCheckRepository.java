package com.spring.ibe.repository;

import com.spring.ibe.entity.BookingCheck;
import com.spring.ibe.entity.BookingCheckId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

public interface BookingCheckRepository extends JpaRepository<BookingCheck, BookingCheckId> {
    @Transactional
    @Modifying
    @Query(value = "INSERT INTO booking_check (tenant_id, property_id,  room_type_id, room_id, start_date, end_date) VALUES (:tenantId, :propertyId, :roomTypeId, :roomId, :startDate, :endDate)", nativeQuery = true)
    void insertBookingCheck(@Param("tenantId") Long tenantId, @Param("propertyId") Long propertyId,
            @Param("roomTypeId") Long roomTypeId, @Param("roomId") Long roomId, @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}

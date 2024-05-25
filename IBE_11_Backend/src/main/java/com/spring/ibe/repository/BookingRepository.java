package com.spring.ibe.repository;

import com.spring.ibe.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query(value = "SELECT * FROM booking b WHERE b.guest_info LIKE %:email%", nativeQuery = true)
    List<Booking> findBookingsByEmail(@Param("email") String email);

    @Query(value = "SELECT COUNT(b) FROM booking b WHERE b.guest_info LIKE %:email% AND b.active = true AND b.end_date <= :currentDate", nativeQuery = true)
    long countSuccessfulBookings(@Param("email") String email, @Param("currentDate") String currentDate);
}

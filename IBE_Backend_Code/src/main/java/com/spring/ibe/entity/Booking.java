package com.spring.ibe.entity;

import com.spring.ibe.dto.request.BookingRequestDTO;
import com.spring.ibe.util.*;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Booking {
    @Id
    private Long bookingId;
    private boolean active = true;
    private String otp = "";
    private String startDate;
    private String endDate;
    private Long roomCount;
    private Long adultCount;
    private Long teenCount = 0L;
    private Long seniorCount = 0L;
    private Long kidCount = 0L;
    private Long tenantId;
    private Long propertyId;
    private Long roomTypeId;
    private String roomName;
    private String roomImageUrl;
    @Convert(converter = CostConverter.class)
    @Column(columnDefinition = "TEXT")
    private BookingRequestDTO.CostDTO costInfo;
    @Convert(converter = PromotionConverter.class)
    @Column(columnDefinition = "TEXT")
    private BookingRequestDTO.PromotionDTO promotionInfo;
    @Convert(converter = GuestConverter.class)
    @Column(columnDefinition = "TEXT")
    private BookingRequestDTO.GuestDTO guestInfo;
    @Convert(converter = BillingConverter.class)
    @Column(columnDefinition = "TEXT")
    private BookingRequestDTO.BillingDTO billingInfo;
    @Convert(converter = PaymentConverter.class)
    @Column(columnDefinition = "TEXT")
    private BookingRequestDTO.PaymentDTO paymentInfo;
}

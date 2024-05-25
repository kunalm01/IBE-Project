package com.spring.ibe.dto.response;

import lombok.Data;

@Data
public class BookingResponseDTO {
    private Long bookingId;
    private boolean active = true;
    private String startDate;
    private String endDate;
    private Long roomCount;
    private Long adultCount;
    private Long teenCount = 0L;
    private Long seniorCount = 0L;
    private Long kidCount = 0L;
    private String roomName;
    private String roomImageUrl;
    private Double totalCost;
    private Double amountDueAtResort;
    private Double nightlyRate;
    private Double taxes;
    private Double vat;
    private String promotionTitle;
    private Double priceFactor;
    private String promotionDescription;
    private String firstName;
    private String lastName;
    private String phone;
    private String email;
    private String firstNameBilling;
    private String lastNameBilling;
    private String address1;
    private String address2;
    private String city;
    private String zipcode;
    private String state;
    private String country;
    private String phoneBilling;
    private String emailBilling;
    private String cardNumber;
    private String expiryMonth;
    private String expiryYear;
}

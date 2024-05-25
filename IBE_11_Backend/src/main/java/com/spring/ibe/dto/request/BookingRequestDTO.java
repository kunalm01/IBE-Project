package com.spring.ibe.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.CreditCardNumber;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequestDTO {
    @NotBlank
    private String startDate;
    @NotBlank
    private String endDate;
    @NotNull
    private Long roomCount;
    @NotNull
    private Long adultCount;
    private Long teenCount = 0L;
    private Long kidCount = 0L;
    private Long seniorCount = 0L;
    private String token = "";
    @NotNull
    private Long tenantId;
    @NotNull
    private Long propertyId;
    @NotNull
    private Long roomTypeId;
    @NotBlank
    private String roomName;
    @NotBlank
    private String roomImageUrl;
    @Valid
    private CostDTO costInfo;
    @Valid
    private PromotionDTO promotionInfo;
    @Valid
    private GuestDTO guestInfo;
    @Valid
    private BillingDTO billingInfo;
    @Valid
    private PaymentDTO paymentInfo;

    @Data
    public static class CostDTO {
        @NotNull
        private Double totalCost;
        @NotNull
        private Double amountDueAtResort;
        @NotNull
        private Double nightlyRate;
        private Double taxes;
        private Double vat;
    }

    @Data
    public static class PromotionDTO {
        private Long promotionId = 0L;
        @NotBlank
        private String promotionTitle;
        @NotNull
        private Double priceFactor;
        @NotBlank
        private String promotionDescription;
    }

    @Data
    public static class GuestDTO {
        @NotBlank
        private String firstName;
        private String lastName;
        @NotBlank
        @Pattern(regexp = "\\d{10}")
        private String phone;
        @NotBlank
        @Email
        private String emailId;
        private boolean hasSubscribed;
    }

    @Data
    public static class BillingDTO {
        @NotBlank
        private String firstName;
        private String lastName;
        @NotBlank
        private String address1;
        private String address2;
        @NotBlank
        private String city;
        @NotBlank
        private String zipcode;
        @NotBlank
        private String state;
        @NotBlank
        private String country;
        @NotBlank
        @Pattern(regexp = "\\d{10}")
        private String phone;
        @NotBlank
        @Email
        private String emailId;
    }

    @Data
    public static class PaymentDTO {
        @NotBlank
        @Size(min = 15, max = 16)
        @CreditCardNumber
        private String cardNumber;
        @NotBlank
        private String expiryMonth;
        @NotBlank
        private String expiryYear;
    }
}

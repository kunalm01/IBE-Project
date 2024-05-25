package com.spring.ibe.dto.response;

import lombok.Data;

/**
 * DTO class representing room promo response.
 */
@Data
public class RoomPromoResponseDTO {
    private double promoPriceFactor = 0.0;

    private String description = "Wrong promo code or the promo code is no longer valid";

    private String promoTitle;
}

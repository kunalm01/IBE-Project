package com.spring.ibe.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO class for retrieving promotions.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionRequestDTO {
    @NotBlank(message = "Start date must not be blank")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Start date must be in the format yyyy-MM-dd")
    private String startDate;

    @NotBlank(message = "End date must not be blank")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "End date must be in the format yyyy-MM-dd")
    private String endDate;

    private Boolean seniorCitizen = true;

    private Boolean military = true;

    private Boolean kduMembership = true;
}

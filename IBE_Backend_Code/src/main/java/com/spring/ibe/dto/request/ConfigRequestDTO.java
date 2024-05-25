package com.spring.ibe.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Request DTO class for configuring application settings.
 */
@Data
public class ConfigRequestDTO {
    @JsonProperty("tenant_id")
    private long tenantId;

    @NotBlank
    @JsonProperty("tenant_header_logo_url")
    private String tenantHeaderLogoUrl;

    @NotBlank
    @JsonProperty("tenant_footer_logo_url")
    private String tenantFooterLogoUrl;

    @NotBlank
    @JsonProperty("tenant_mini_logo_url")
    private String tenantMiniLogoUrl;

    @NotBlank
    @JsonProperty("tenant_name")
    private String tenantName;

    @NotBlank
    @JsonProperty("tenant_full_name")
    private String tenantFullName;

    @NotBlank
    @JsonProperty("application_title")
    private String applicationTitle;

    @NotBlank
    @JsonProperty("background_image_url")
    private String backgroundImageUrl;

    @NotBlank
    @JsonProperty("banner_image_url")
    private String bannerImageUrl;

    @NotNull
    @Valid
    @JsonProperty("supported_languages")
    private List<LanguageDTO> supportedLanguages;

    @NotNull
    @Valid
    @JsonProperty("supported_currencies")
    private List<CurrencyDTO> supportedCurrencies;

    @NotNull
    @JsonProperty("language_wise_currency")
    private Map<@NotBlank String, @NotBlank String> languageWiseCurrency;

    @NotNull
    @JsonProperty("properties")
    private Map<@NotBlank String, @Valid PropertyDTO> properties;

    @Data
    public static class LanguageDTO {
        @NotBlank
        private String name;
        @NotBlank
        private String symbol;
    }

    @Data
    public static class CurrencyDTO {
        @NotBlank
        private String name;
        @NotBlank
        private String symbol;
    }

    @Data
    public static class PropertyDTO {
        @NotNull
        @JsonProperty("allowed_options")
        private List<@Valid OptionDTO> allowedOptions;

        @NotNull
        @JsonProperty("allowed_guests")
        private List<@Valid GuestOptionDTO> allowedGuests;

        @NotNull
        @JsonProperty("property_id")
        private int propertyId;

        @NotNull
        @JsonProperty("maximum_rooms_allowed")
        private int maximumRoomsAllowed;

        @NotNull
        @JsonProperty("maximum_guests_in_a_room")
        private int maximumGuestsInARoom;

        @NotNull
        @JsonProperty("maximum_beds_in_a_room")
        private int maximumBedsInARoom;

        @NotNull
        @JsonProperty("maximum_length_of_stay")
        private int maximumLengthOfStay;

        @NotNull
        @JsonProperty("page_size")
        private int pageSize;

        @NotNull
        @JsonProperty("tax_percentage")
        private double taxPercentage;

        @NotNull
        @JsonProperty("vat_percentage")
        private double vatPercentage;

        @NotNull
        @JsonProperty("due_now_percentage")
        private double dueNowPercentage;

        @JsonProperty("last_name_required")
        private boolean lastNameRequired;

        @NotNull
        private List<@Valid FilterDTO> filters;

        @NotNull
        private List<@Valid OptionDTO> sort;
    }

    @Data
    public static class OptionDTO {
        @NotBlank
        private String title;
        @NotNull
        private boolean active;
    }

    @Data
    public static class GuestOptionDTO {
        @NotBlank
        private String title;
        @NotBlank
        private String age;
        @NotNull
        private boolean active;
    }

    @Data
    public static class FilterDTO {
        @NotBlank
        private String name;
        @NotNull
        private List<@Valid OptionDTO> values;
        @NotNull
        private boolean active;
    }
}

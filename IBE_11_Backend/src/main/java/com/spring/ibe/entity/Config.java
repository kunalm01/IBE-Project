package com.spring.ibe.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.spring.ibe.dto.request.ConfigRequestDTO;
import com.spring.ibe.util.ConfigConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Represents the configuration entity containing various settings.
 */
@Data
@Entity
@Table(name = "config")
public class Config {
    /**
     * The unique identifier for the configuration.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long tenantId;

    /**
     * Represents the inner configuration details.
     */
    @Convert(converter = ConfigConverter.class)
    @Column(columnDefinition = "TEXT")
    private InnerConfig config;

    @Data
    public static class InnerConfig {
        @JsonProperty("tenant_header_logo_url")
        private String tenantHeaderLogoUrl;

        @JsonProperty("tenant_footer_logo_url")
        private String tenantFooterLogoUrl;

        @JsonProperty("tenant_mini_logo_url")
        private String tenantMiniLogoUrl;

        @NotBlank
        @JsonProperty("tenant_name")
        private String tenantName;

        @JsonProperty("tenant_full_name")
        private String tenantFullName;

        @JsonProperty("application_title")
        private String applicationTitle;

        @JsonProperty("background_image_url")
        private String backgroundImageUrl;

        @JsonProperty("banner_image_url")
        private String bannerImageUrl;

        @JsonProperty("supported_languages")
        private List<ConfigRequestDTO.LanguageDTO> supportedLanguages;

        @JsonProperty("supported_currencies")
        private List<ConfigRequestDTO.CurrencyDTO> supportedCurrencies;

        @JsonProperty("language_wise_currency")
        private Map<String, String> languageWiseCurrency;

        @JsonProperty("properties")
        private Map<String, ConfigRequestDTO.PropertyDTO> properties;
    }

}

package com.spring.ibe.util;

import com.spring.ibe.dto.request.ConfigRequestDTO;
import com.spring.ibe.entity.Config;
import com.spring.ibe.exception.custom.UnprocessableEntityException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;

/**
 * Converter class to convert between Config.InnerConfig and String for database
 * storage.
 */
@Converter(autoApply = true)
public class ConfigConverter implements AttributeConverter<Config.InnerConfig, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Converts Config.InnerConfig object to its JSON string representation.
     * 
     * @param config The Config.InnerConfig object to convert.
     * @return JSON string representation of the Config.InnerConfig object.
     * @throws UnprocessableEntityException if an error occurs during JSON
     *                                      conversion.
     */
    @Override
    public String convertToDatabaseColumn(Config.InnerConfig config) {
        try {
            return objectMapper.writeValueAsString(config);
        } catch (Exception e) {
            throw new UnprocessableEntityException("Error converting Config to JSON");
        }
    }

    /**
     * Converts JSON string representation to Config.InnerConfig object.
     * 
     * @param json The JSON string to convert.
     * @return Config.InnerConfig object parsed from the JSON string.
     * @throws UnprocessableEntityException if an error occurs during JSON
     *                                      conversion.
     */
    @Override
    public Config.InnerConfig convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, Config.InnerConfig.class);
        } catch (IOException e) {
            throw new UnprocessableEntityException("Error converting JSON to Config");
        }
    }

    public static ConfigRequestDTO createConfigRequestDTO(Config config) {
        Config.InnerConfig innerConfig = config.getConfig();
        ConfigRequestDTO dto = new ConfigRequestDTO();

        dto.setTenantId(config.getTenantId());
        dto.setTenantHeaderLogoUrl(innerConfig.getTenantHeaderLogoUrl());
        dto.setTenantFooterLogoUrl(innerConfig.getTenantFooterLogoUrl());
        dto.setTenantMiniLogoUrl(innerConfig.getTenantMiniLogoUrl());
        dto.setTenantName(innerConfig.getTenantName());
        dto.setTenantFullName(innerConfig.getTenantFullName());
        dto.setApplicationTitle(innerConfig.getApplicationTitle());
        dto.setBackgroundImageUrl(innerConfig.getBackgroundImageUrl());
        dto.setBannerImageUrl(innerConfig.getBannerImageUrl());
        dto.setSupportedLanguages(innerConfig.getSupportedLanguages());
        dto.setSupportedCurrencies(innerConfig.getSupportedCurrencies());
        dto.setLanguageWiseCurrency(innerConfig.getLanguageWiseCurrency());
        dto.setProperties(innerConfig.getProperties());

        return dto;
    }

    /**
     * Converts a ConfigRequestDTO to a Config entity object.
     *
     * @param dto The ConfigRequestDTO to convert.
     * @return Config entity object created from the ConfigRequestDTO.
     */
    public static Config createConfig(ConfigRequestDTO dto) {
        Config config = new Config();
        Config.InnerConfig innerConfig = new Config.InnerConfig();

        innerConfig.setTenantHeaderLogoUrl(dto.getTenantHeaderLogoUrl());
        innerConfig.setTenantFooterLogoUrl(dto.getTenantFooterLogoUrl());
        innerConfig.setTenantMiniLogoUrl(dto.getTenantMiniLogoUrl());
        innerConfig.setTenantName(dto.getTenantName());
        innerConfig.setTenantFullName(dto.getTenantFullName());
        innerConfig.setApplicationTitle(dto.getApplicationTitle());
        innerConfig.setBackgroundImageUrl(dto.getBackgroundImageUrl());
        innerConfig.setBannerImageUrl(dto.getBannerImageUrl());
        innerConfig.setSupportedLanguages(dto.getSupportedLanguages());
        innerConfig.setSupportedCurrencies(dto.getSupportedCurrencies());
        innerConfig.setLanguageWiseCurrency(dto.getLanguageWiseCurrency());
        innerConfig.setProperties(dto.getProperties());

        config.setConfig(innerConfig);
        config.setTenantId(dto.getTenantId());

        return config;
    }
}

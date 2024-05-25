package com.spring.ibe.service;

import com.spring.ibe.dto.request.ConfigRequestDTO;
import com.spring.ibe.entity.Config;
import com.spring.ibe.exception.custom.DataNotFoundException;
import com.spring.ibe.exception.custom.UnprocessableEntityException;
import com.spring.ibe.repository.ConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import static com.spring.ibe.util.ConfigConverter.createConfig;
import static com.spring.ibe.util.ConfigConverter.createConfigRequestDTO;

/**
 * Service class for managing configuration settings.
 */
@Service
@Slf4j
public class ConfigService {
    private final ConfigRepository configRepository;

    /**
     * Constructor for ConfigService.
     * 
     * @param configRepository The repository for handling Config entities.
     */
    @Autowired
    public ConfigService(ConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    /**
     * Save configuration settings.
     * 
     * @param configRequestDTO The DTO containing the configuration settings.
     * @throws UnprocessableEntityException Thrown if there is an issue saving the
     *                                      configuration.
     */
    public void saveConfig(ConfigRequestDTO configRequestDTO) throws UnprocessableEntityException {
        try {
            configRepository.save(createConfig(configRequestDTO));
            log.info("Configuration settings saved successfully");
        } catch (Exception e) {
            log.error("Failed to save config: {}", e.getMessage());
            throw new UnprocessableEntityException("Cannot save config. Please check the entity again.");
        }
    }

    /**
     * Get configuration settings by tenant ID.
     * 
     * @param tenantId The ID of the tenant.
     * @return The DTO containing the configuration settings.
     * @throws DataNotFoundException Thrown if no configuration settings are found
     *                               for the given ID.
     */
    @Cacheable("config")
    public ConfigRequestDTO getConfig(long tenantId) throws DataNotFoundException {
        try {
            Config config = configRepository.findById(tenantId).orElseThrow(() -> {
                log.info("No config found for tenant ID: {}", tenantId);
                return new DataNotFoundException("No config exists for the given tenant ID.");
            });
            return createConfigRequestDTO(config);
        } catch (Exception e) {
            log.error("Failed to get config: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Update configuration settings.
     * 
     * @param tenantId         The ID of the tenant.
     * @param configRequestDTO The DTO containing the updated configuration
     *                         settings.
     * @throws UnprocessableEntityException Thrown if there is an issue updating the
     *                                      configuration.
     */
    public void updateConfig(long tenantId, ConfigRequestDTO configRequestDTO) throws UnprocessableEntityException {
        try {
            Config config = createConfig(configRequestDTO);
            config.setTenantId(tenantId);
            configRepository.save(config);
            log.info("Configuration settings updated successfully for tenant ID: {}", tenantId);
        } catch (Exception e) {
            log.error("Failed to update config: {}", e.getMessage());
            throw new UnprocessableEntityException("Cannot update config. Please check the entity again.");
        }
    }
}

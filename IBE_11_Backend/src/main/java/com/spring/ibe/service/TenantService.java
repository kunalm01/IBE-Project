package com.spring.ibe.service;

import com.spring.ibe.dto.request.TenantRequestDTO;
import com.spring.ibe.entity.Tenant;
import com.spring.ibe.exception.custom.UnprocessableEntityException;
import com.spring.ibe.repository.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TenantService {

    private TenantRepository tenantRepository;
    private PasswordEncoder passwordEncoder;

    public TenantService(TenantRepository tenantRepository, PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Save tenant.
     *
     * @param tenantRequestDTO The DTO containing the tenant info.
     * @throws UnprocessableEntityException Thrown if there is an issue saving the
     *                                      configuration.
     */
    public void saveTenant(TenantRequestDTO tenantRequestDTO) {
        try {
            tenantRepository.save(createTenant(tenantRequestDTO));
            log.info("Tenant saved successfully");
        } catch (Exception e) {
            log.error("Failed to save tenant: {}", e.getMessage());
            throw new UnprocessableEntityException("Cannot save tenant. Please check the entity again.");
        }
    }

    private Tenant createTenant(TenantRequestDTO tenantRequestDTO) {
        Tenant tenant = new Tenant();
        tenant.setTenantName(tenantRequestDTO.getTenantName());
        tenant.setSecretKey(passwordEncoder.encode(tenantRequestDTO.getSecretKey()));
        return tenant;
    }
}

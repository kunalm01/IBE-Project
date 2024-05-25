package com.spring.ibe.repository;

import com.spring.ibe.entity.Config;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository interface for managing Config entities.
 */
public interface ConfigRepository extends JpaRepository<Config, Long> {
}

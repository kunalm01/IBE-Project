package com.spring.ibe.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class for CORS (Cross-Origin Resource Sharing) settings.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    /**
     * Add CORS mappings to the registry.
     * 
     * @param registry The CORS registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("https://delightful-beach-0ccf2090f.5.azurestaticapps.net", "http://localhost:5173",
                        "https://zealous-bay-013315d10.4.azurestaticapps.net",
                        "https://team-11-ibe-front-door-cvbsc5cjhnezeteg.z02.azurefd.net")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

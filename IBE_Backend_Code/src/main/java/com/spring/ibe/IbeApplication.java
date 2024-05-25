package com.spring.ibe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class IbeApplication {

	public static void main(String[] args) {
		SpringApplication.run(IbeApplication.class, args);
	}
}

package com.spring.ibe.controller;

import com.spring.ibe.dto.request.EmailRequestDTO;
import com.spring.ibe.service.EmailService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling email sending.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class EmailController {

    private final EmailService emailService;

    /**
     * Constructor for EmailController.
     *
     * @param emailService The email service to handle email operations.
     */
    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Endpoint to send an email.
     *
     * @param emailRequestDTO The DTO containing email details.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/email")
    public ResponseEntity<String> postEmail(@Valid @RequestBody EmailRequestDTO emailRequestDTO) {
        log.info("Received request to send email: {}", emailRequestDTO);
        emailService.sendEmail(emailRequestDTO);
        log.info("Email sent successfully");
        return ResponseEntity.ok("Email sent successfully");
    }
}
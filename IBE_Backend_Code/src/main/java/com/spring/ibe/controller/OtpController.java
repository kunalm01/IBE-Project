package com.spring.ibe.controller;

import com.spring.ibe.dto.request.GenerateOtpRequestDTO;
import com.spring.ibe.dto.request.VerifyOtpRequestDTO;
import com.spring.ibe.dto.response.VerifyOtpResponseDTO;
import com.spring.ibe.service.OtpService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling OTP-related operations.
 */
@RestController
@RequestMapping(API_TITLE)
@Slf4j
public class OtpController {

    private final OtpService otpService;

    /**
     * Constructor for OtpController.
     *
     * @param otpService The OTP service to handle OTP operations.
     */
    @Autowired
    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    /**
     * Endpoint to generate OTP.
     *
     * @param generateOtpRequestDTO The DTO containing details for generating OTP.
     * @return ResponseEntity indicating the success of the operation.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<String> generateOtp(@Valid @RequestBody GenerateOtpRequestDTO generateOtpRequestDTO) {
        log.info("Received request to generate OTP for booking ID: {}", generateOtpRequestDTO.getBookingId());
        otpService.generateOtp(generateOtpRequestDTO);
        log.info("OTP generated successfully");
        return ResponseEntity.ok("OTP generated successfully");
    }

    /**
     * Endpoint to verify OTP.
     *
     * @param verifyOtpRequestDTO The DTO containing details for verifying OTP.
     * @return ResponseEntity containing the verification response.
     */
    @PostMapping("verify-otp")
    public ResponseEntity<VerifyOtpResponseDTO> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO verifyOtpRequestDTO) {
        log.info("Received request to verify OTP for booking ID: {}", verifyOtpRequestDTO.getBookingId());
        VerifyOtpResponseDTO responseDTO = otpService.verifyOtp(verifyOtpRequestDTO);
        log.info("OTP verification response: {}", responseDTO.getMessage());
        return ResponseEntity.ok(responseDTO);
    }
}

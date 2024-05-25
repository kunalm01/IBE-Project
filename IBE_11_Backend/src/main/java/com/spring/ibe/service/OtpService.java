package com.spring.ibe.service;

import com.spring.ibe.dto.request.GenerateOtpRequestDTO;
import com.spring.ibe.dto.request.VerifyOtpRequestDTO;
import com.spring.ibe.dto.response.VerifyOtpResponseDTO;
import com.spring.ibe.entity.Booking;
import com.spring.ibe.exception.custom.DataNotFoundException;
import com.spring.ibe.repository.BookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Random;

/**
 * Service class for handling OTP-related operations.
 */
@Service
@Slf4j
public class OtpService {

    private final EmailService emailService;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    /**
     * Constructor for initializing the OtpService.
     *
     * @param emailService      The email service.
     * @param bookingRepository The repository for bookings.
     */
    public OtpService(EmailService emailService, BookingRepository bookingRepository, BookingService bookingService) {
        this.emailService = emailService;
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    /**
     * Generates OTP for the given booking ID and sends it via email.
     *
     * @param generateOtpRequestDTO The request object containing the booking ID.
     */
    public void generateOtp(GenerateOtpRequestDTO generateOtpRequestDTO) {
        String otp = generateRandomOtp();
        Booking booking = bookingRepository.findById(generateOtpRequestDTO.getBookingId()).orElseThrow(() -> {
            log.error("Booking with ID {} does not exist", generateOtpRequestDTO.getBookingId());
            return new DataNotFoundException("Booking with given bookingId does not exist");
        });
        booking.setOtp(otp);
        bookingRepository.save(booking);
        emailService.sendOtpEmail(generateOtpRequestDTO, otp);
        log.info("OTP generated and sent for booking ID {}", generateOtpRequestDTO.getBookingId());
    }

    /**
     * Verifies the OTP for the given booking ID.
     *
     * @param verifyOtpRequestDTO The request object containing the booking ID and
     *                            OTP.
     * @return The response object indicating the result of OTP verification.
     */
    public VerifyOtpResponseDTO verifyOtp(VerifyOtpRequestDTO verifyOtpRequestDTO) {
        Booking booking = bookingRepository.findById(verifyOtpRequestDTO.getBookingId()).orElseThrow(() -> {
            log.error("Booking with ID {} does not exist", verifyOtpRequestDTO.getBookingId());
            return new DataNotFoundException("Booking with given bookingId does not exist");
        });
        if (booking.getOtp().equals(verifyOtpRequestDTO.getOtp())) {
            booking.setOtp("");
            bookingRepository.save(booking);
            bookingService.cancelBooking(verifyOtpRequestDTO.getBookingId());
            log.info("OTP verified successfully for booking ID {}", verifyOtpRequestDTO.getBookingId());
            return new VerifyOtpResponseDTO("Otp verified successfully");
        }
        log.info("OTP verification failed for booking ID {}", verifyOtpRequestDTO.getBookingId());
        return new VerifyOtpResponseDTO();
    }

    /**
     * Generates a random OTP.
     *
     * @return The randomly generated OTP.
     */
    private String generateRandomOtp() {
        Random random = new Random();
        int otpValue = random.nextInt(900000) + 100000;
        return String.valueOf(otpValue);
    }
}

package com.spring.ibe.controller;

import com.spring.ibe.dto.request.BookingRequestDTO;
import com.spring.ibe.dto.response.BookingResponseDTO;
import com.spring.ibe.dto.response.MyBookingsResponseDTO;
import com.spring.ibe.dto.response.ReviewBookingResponseDTO;
import com.spring.ibe.dto.response.SuccessFulBookingResponseDTO;
import com.spring.ibe.service.BookingService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.web.bind.annotation.*;
import static com.spring.ibe.constants.Constants.API_TITLE;

/**
 * Controller class for handling booking-related endpoints.
 */
@RestController
@RequestMapping(API_TITLE)
@EnableTransactionManagement
@Slf4j
public class BookingController {
    private final BookingService bookingService;

    /**
     * Constructor for BookingController.
     *
     * @param bookingService The booking service to handle booking operations.
     */
    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Endpoint to create a new booking.
     *
     * @param bookingRequestDTO The DTO containing booking details.
     * @return ResponseEntity containing the ID of the created booking.
     */
    @PostMapping("/create-booking")
    public ResponseEntity<Long> postBooking(@RequestBody @Valid BookingRequestDTO bookingRequestDTO) {
        log.info("Received request to create booking: {}", bookingRequestDTO);
        Long bookingId = bookingService.createBookingCheck(bookingRequestDTO);
        log.info("Created booking with ID: {}", bookingId);
        return ResponseEntity.ok(bookingId);
    }

    /**
     * Endpoint to cancel a booking.
     *
     * @param bookingId The ID of the booking to be canceled.
     * @return ResponseEntity indicating the success of the operation.
     */
    @DeleteMapping("/cancel-booking/{bookingId}")
    public ResponseEntity<String> cancelBooking(@Valid @PathVariable Long bookingId, @RequestHeader String token) {
        log.info("Received request to cancel booking with ID: {}", bookingId);
        bookingService.cancelBooking(bookingId, token);
        log.info("Canceled booking with ID: {}", bookingId);
        return ResponseEntity.ok("Booking canceled");
    }

    /**
     * Endpoint to retrieve booking details by ID.
     *
     * @param bookingId The ID of the booking to retrieve.
     * @return ResponseEntity containing the booking details.
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<BookingResponseDTO> getBooking(@Valid @PathVariable Long bookingId) {
        log.info("Received request to retrieve booking with ID: {}", bookingId);
        BookingResponseDTO bookingResponseDTO = bookingService.getBooking(bookingId);
        log.info("Retrieved booking with ID: {}", bookingId);
        return ResponseEntity.ok(bookingResponseDTO);
    }

    /**
     * Endpoint to retrieve bookings for a specific email.
     *
     * @param email The email for which bookings are to be retrieved.
     * @return ResponseEntity containing the bookings for the specified email.
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<MyBookingsResponseDTO> getMyBookings(@Valid @RequestParam String email, @RequestHeader String token) {
        log.info("Received request to retrieve bookings for email: {}", email);
        MyBookingsResponseDTO myBookingsResponseDTO = bookingService.getMyBookings(email, token);
        log.info("Retrieved bookings for email: {}", email);
        return ResponseEntity.ok(myBookingsResponseDTO);
    }

    /**
     * Endpoint to retrieve booking details for review by ID.
     *
     * @param bookingId The ID of the booking to retrieve for review.
     * @return ResponseEntity containing the booking details for review.
     */
    @GetMapping("/review-booking/{bookingId}")
    public ResponseEntity<ReviewBookingResponseDTO> getBookingForReview(@Valid @PathVariable Long bookingId) {
        log.info("Received request to retrieve booking for review with ID: {}", bookingId);
        ReviewBookingResponseDTO reviewBookingResponseDTO = bookingService.getBookingForReview(bookingId);
        log.info("Retrieved booking for review with ID: {}", bookingId);
        return ResponseEntity.ok(reviewBookingResponseDTO);
    }

    /**
     * Endpoint to retrieve successful bookings for a specific email.
     *
     * @param emailId The email for which successful bookings are to be retrieved.
     * @return ResponseEntity containing the successful bookings for the specified
     *         email.
     */
    @GetMapping("/successful-bookings/{emailId}")
    public ResponseEntity<SuccessFulBookingResponseDTO> getSuccessFulBookings(@Valid @PathVariable String emailId, @RequestHeader String token) {
        log.info("Received request to retrieve successful bookings for email: {}", emailId);
        SuccessFulBookingResponseDTO successFulBookingResponseDTO = bookingService.getSuccessFulBookings(emailId, token);
        log.info("Retrieved successful bookings for email: {}", emailId);
        return ResponseEntity.ok(successFulBookingResponseDTO);
    }

    /**
     * Endpoint to delete all bookings.
     *
     * @return ResponseEntity indicating the success of the operation.
     */
    @DeleteMapping("/delete-all-bookings/{tenantId}")
    public ResponseEntity<String> deleteAllBookings(@RequestHeader String secretKey, @PathVariable Long tenantId) {
        log.info("Received request to delete all bookings");
        bookingService.deleteAllBookings(tenantId, secretKey);
        log.info("Deleted all bookings");
        return ResponseEntity.ok("All bookings deleted successfully");
    }

    @GetMapping("/check-booking/{bookingId}")
    public ResponseEntity<String> checkBooking(@PathVariable Long bookingId) {
        log.info("Received request to check booking");
        bookingService.checkBooking(bookingId);
        return ResponseEntity.ok("Booking checked successfully");
    }
}

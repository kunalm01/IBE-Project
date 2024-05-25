package com.spring.ibe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.constants.Constants;
import com.spring.ibe.constants.GraphqlQuery;
import com.spring.ibe.dto.request.BookingRequestDTO;
import com.spring.ibe.dto.request.RoomIdRequestDTO;
import com.spring.ibe.dto.response.BookingResponseDTO;
import com.spring.ibe.dto.response.MyBookingsResponseDTO;
import com.spring.ibe.dto.response.ReviewBookingResponseDTO;
import com.spring.ibe.dto.response.SuccessFulBookingResponseDTO;
import com.spring.ibe.entity.*;
import com.spring.ibe.exception.custom.*;
import com.spring.ibe.repository.BookingCheckRepository;
import com.spring.ibe.repository.BookingRepository;
import com.spring.ibe.repository.TenantRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Service class for handling booking-related operations.
 */
@Service
@Slf4j
public class BookingService {

    private final String graphqlUrl;
    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();
    private final BookingCheckRepository bookingCheckRepository;
    private final BookingRepository bookingRepository;
    private final GuestUserService guestUserService;
    private final RoomService roomService;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;

    @Autowired
    public BookingService(BookingCheckRepository bookingCheckRepository, PasswordEncoder passwordEncoder, TenantRepository tenantRepository, BookingRepository bookingRepository,
            GuestUserService guestUserService, RoomService roomService, @Value("${app.graphql_url}") String graphqlUrl,
            @Value("${app.graphql_api_key}") String apiKey) {
        this.bookingCheckRepository = bookingCheckRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.bookingRepository = bookingRepository;
        this.guestUserService = guestUserService;
        this.roomService = roomService;
        this.apiKey = apiKey;
        this.graphqlUrl = graphqlUrl;
    }

    /**
     * Creates a booking check for the provided booking request.
     *
     * @param bookingRequestDTO The DTO containing the booking request details.
     * @return The booking ID.
     */
    public Long createBookingCheck(BookingRequestDTO bookingRequestDTO) {
        LocalDate startDate = LocalDate.parse(bookingRequestDTO.getStartDate());
        LocalDate endDate = LocalDate.parse(bookingRequestDTO.getEndDate());
        Long roomTypeId = bookingRequestDTO.getRoomTypeId();
        Long propertyId = bookingRequestDTO.getPropertyId();
        Long tenantId = bookingRequestDTO.getTenantId();
        Long roomCount = bookingRequestDTO.getRoomCount();
        Long bookingId = -1L;

        List<Integer> availableRoomIds = roomService.getRoomIds(new RoomIdRequestDTO(bookingRequestDTO.getStartDate(),
                bookingRequestDTO.getEndDate(), roomTypeId, propertyId, roomCount)).getListRoomIds();
        List<Integer> selectedRoomIds = new ArrayList<>();
        for (Integer availableRoomId : availableRoomIds) {
            try {
                bookingCheckRepository.insertBookingCheck(tenantId, propertyId, roomTypeId, availableRoomId.longValue(),
                        startDate, endDate);
                selectedRoomIds.add(availableRoomId);
                log.info("Booking check inserted for room id: {}", availableRoomId);
            } catch (DataIntegrityViolationException e) {
                log.error("Transaction failed: Constraint violation - {}", e.getMessage());
            } catch (Exception e) {
                log.error("Transaction failed: {}", e.getMessage());
            }
            if (selectedRoomIds.size() >= roomCount) {
                break;
            }
        }
        if (selectedRoomIds.size() < roomCount) {
            for (Integer roomId : selectedRoomIds) {
                BookingCheckId bookingCheckId = new BookingCheckId(tenantId, propertyId, roomTypeId, roomId.longValue(),
                        startDate, endDate);
                BookingCheck bookingCheck = bookingCheckRepository.findById(bookingCheckId).orElse(null);
                if (!Objects.isNull(bookingCheck)) {
                    bookingCheckRepository.delete(bookingCheck);
                    log.info("Booking check deleted for room id: {}", roomId);
                }
            }
            throw new RuntimeException("Booking failed due to non-availability");
        }

        List<Long> availabilityIds = new ArrayList<>();
        if (selectedRoomIds.size() >= roomCount) {
            Long guestId = checkGuestInfo(bookingRequestDTO.getGuestInfo(), bookingRequestDTO.getToken());
            if (guestId != -1L) {
                for (Integer selectedRoomId : selectedRoomIds) {
                    List<Long> availabilityIdsForSelectedRoom = getAvailabilityIdsForSelectedRoom(selectedRoomId,
                            propertyId, bookingRequestDTO.getStartDate(), bookingRequestDTO.getEndDate());
                    availabilityIds.addAll(availabilityIdsForSelectedRoom);
                }
                Long availabilityId1 = availabilityIds.get(0);
                bookingId = createBooking(availabilityId1, bookingRequestDTO, guestId);
                if (bookingId != -1L) {
                    for (int i = 1; i < availabilityIds.size(); i++) {
                        updateRoomAvailability(availabilityIds.get(i), bookingId);
                    }
                }
            }
        }

        for (Integer roomId : selectedRoomIds) {
            BookingCheckId bookingCheckId = new BookingCheckId(tenantId, propertyId, roomTypeId, roomId.longValue(),
                    startDate, endDate);
            BookingCheck bookingCheck = bookingCheckRepository.findById(bookingCheckId).orElse(null);
            if (!Objects.isNull(bookingCheck)) {
                bookingCheckRepository.delete(bookingCheck);
                log.info("Booking check deleted for room id: {}", roomId);
            }
        }

        return bookingId;
    }

    /**
     * Updates the room availability based on the provided availability ID and
     * booking ID.
     *
     * @param availabilityId The availability ID.
     * @param bookingId      The booking ID.
     */
    public void updateRoomAvailability(Long availabilityId, Long bookingId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(Constants.API_KEY_TITLE, apiKey);

        String UPDATE_ROOM_AVAILABILITY = String.format(GraphqlQuery.UPDATE_ROOM_AVAILABILITY, availabilityId,
                bookingId, bookingId);
        String requestBody = "{ \"query\": \"" + UPDATE_ROOM_AVAILABILITY + "\" }";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                String.class);
        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            log.info("Room availability updated for availability id: {} with booking id: {}", availabilityId,
                    bookingId);
        } else {
            log.error("Failed to update room availability for availability id: {} with booking id: {}", availabilityId,
                    bookingId);
        }
    }

    /**
     * Creates a booking with the provided availability ID and booking request.
     *
     * @param availabilityId    The availability ID.
     * @param bookingRequestDTO The DTO containing the booking request details.
     * @param guestId           The guest ID.
     * @return The booking ID.
     */
    public Long createBooking(Long availabilityId, BookingRequestDTO bookingRequestDTO, Long guestId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(Constants.API_KEY_TITLE, apiKey);

        String CREATE_BOOKING = bookingRequestDTO.getPromotionInfo().getPromotionId() == 0
                ? String.format(GraphqlQuery.CREATE_BOOKING_WITHOUT_PROMOTION, bookingRequestDTO.getStartDate(),
                        bookingRequestDTO.getEndDate(), bookingRequestDTO.getAdultCount(),
                        bookingRequestDTO.getKidCount(), bookingRequestDTO.getCostInfo().getTotalCost().intValue(),
                        bookingRequestDTO.getCostInfo().getAmountDueAtResort().intValue(), 1,
                        guestId, bookingRequestDTO.getPropertyId(), availabilityId)
                : String.format(GraphqlQuery.CREATE_BOOKING, bookingRequestDTO.getStartDate(),
                        bookingRequestDTO.getEndDate(), bookingRequestDTO.getAdultCount(),
                        bookingRequestDTO.getKidCount(), bookingRequestDTO.getCostInfo().getTotalCost().intValue(),
                        bookingRequestDTO.getCostInfo().getAmountDueAtResort().intValue(), 1,
                        guestId, bookingRequestDTO.getPromotionInfo().getPromotionId(),
                        bookingRequestDTO.getPropertyId(), availabilityId);
        String requestBody = "{ \"query\": \"" + CREATE_BOOKING + "\" }";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                String.class);

        Long bookingId;
        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            String jsonResponse = responseEntity.getBody();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode bookingData = root.path("data").path("createBooking");
                bookingId = bookingData.path("booking_id").asLong();
                log.info("Booking created with ID: {}", bookingId);
            } catch (IOException e) {
                log.error("Failed to parse createBooking response: {}", e.getMessage());
                throw new FetchFailedException("Failed to parse listRoomAvailabilities response.");
            }
        } else {
            log.error("Failed to create booking: {}", responseEntity.getStatusCode());
            throw new FetchFailedException("Failed to parse listRoomAvailabilities response.");
        }
        createBooking(bookingId, bookingRequestDTO);
        return bookingId;
    }

    /**
     * Creates a booking entity in the database.
     *
     * @param bookingId         The booking ID.
     * @param bookingRequestDTO The DTO containing the booking request details.
     */
    public void createBooking(Long bookingId, BookingRequestDTO bookingRequestDTO) {
        Booking booking = new Booking();
        booking.setBookingId(bookingId);
        booking.setActive(true);
        booking.setStartDate(bookingRequestDTO.getStartDate());
        booking.setEndDate(bookingRequestDTO.getEndDate());
        booking.setRoomCount(bookingRequestDTO.getRoomCount());
        booking.setAdultCount(bookingRequestDTO.getAdultCount());
        booking.setTeenCount(bookingRequestDTO.getTeenCount());
        booking.setKidCount(bookingRequestDTO.getKidCount());
        booking.setSeniorCount(bookingRequestDTO.getSeniorCount());
        booking.setTenantId(bookingRequestDTO.getTenantId());
        booking.setPropertyId(bookingRequestDTO.getPropertyId());
        booking.setRoomTypeId(bookingRequestDTO.getRoomTypeId());
        booking.setRoomName(bookingRequestDTO.getRoomName());
        booking.setRoomImageUrl(bookingRequestDTO.getRoomImageUrl());
        booking.setCostInfo(bookingRequestDTO.getCostInfo());
        booking.setPromotionInfo(bookingRequestDTO.getPromotionInfo());
        booking.setGuestInfo(bookingRequestDTO.getGuestInfo());
        booking.setBillingInfo(bookingRequestDTO.getBillingInfo());
        booking.setPaymentInfo(bookingRequestDTO.getPaymentInfo());
        try {
            bookingRepository.save(booking);
            log.info("Booking created successfully with ID: {}", bookingId);
        } catch (Exception e) {
            log.error("Failed to create booking: {}", e.getMessage());
            throw new UnprocessableEntityException("Entity cannot be processed");
        }
    }

    /**
     * Retrieves the availability IDs for the selected room.
     *
     * @param roomId     The room ID.
     * @param propertyId The property ID.
     * @param startDate  The start date.
     * @param endDate    The end date.
     * @return The list of availability IDs.
     */
    public List<Long> getAvailabilityIdsForSelectedRoom(Integer roomId, Long propertyId, String startDate,
            String endDate) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set(Constants.API_KEY_TITLE, apiKey);

        String GET_SELECTED_ROOM_AVAILABILITIES = String.format(GraphqlQuery.GET_SELECTED_ROOM_AVAILABILITIES,
                startDate, endDate, propertyId, roomId);
        String requestBody = "{ \"query\": \"" + GET_SELECTED_ROOM_AVAILABILITIES + "\" }";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                String.class);
        List<Long> roomAvailabilities = new ArrayList<>();
        if (responseEntity.getStatusCode() == HttpStatus.OK) {
            String jsonResponse = responseEntity.getBody();
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(jsonResponse);
                JsonNode roomAvailabilitiesData = root.path("data").path("listRoomAvailabilities");

                for (JsonNode availability : roomAvailabilitiesData) {
                    long availabilityId = availability.path("availability_id").asLong();
                    roomAvailabilities.add(availabilityId);
                }
                log.info("Room availabilities retrieved successfully for room ID: {}, property ID: {}", roomId,
                        propertyId);
            } catch (IOException e) {
                log.error("Failed to parse listRoomAvailabilities response: {}", e.getMessage());
                throw new FetchFailedException("Failed to parse listRoomAvailabilities response.");
            }
        } else {
            log.error("Failed to fetch room availabilities for room ID: {}, property ID: {}", roomId, propertyId);
            throw new FetchFailedException("Failed to parse listRoomAvailabilities response.");
        }
        return roomAvailabilities;
    }

    /**
     * Checks if the guest information exists, and creates a new guest if not.
     *
     * @param guestDTO The DTO containing the guest information.
     * @return The guest ID.
     */
    public Long checkGuestInfo(BookingRequestDTO.GuestDTO guestDTO, String token) {
        List<GuestUser> guestUsers = guestUserService.getAllUsers();
        Long guestId = -1L;
        boolean guestExists = false;
        for (GuestUser guestUser : guestUsers) {
            if (guestUser.getEmailId().equals(guestDTO.getEmailId())) {
                guestExists = true;
                guestId = guestUser.getUserId();
                break;
            }
        }
        if (!guestExists) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);

            String CREATE_GUEST = String.format(GraphqlQuery.CREATE_GUEST, guestDTO.getFirstName());
            String requestBody = "{ \"query\": \"" + CREATE_GUEST + "\" }";
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);
            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode guestData = root.path("data").path("createGuest");
                    guestId = guestData.path("guest_id").asLong();
                    log.info("Guest created successfully with ID: {}", guestId);
                } catch (IOException e) {
                    log.error("Failed to parse guests response: {}", e.getMessage());
                    throw new FetchFailedException("Failed to parse guests response.");
                }
            } else {
                log.error("Failed to create guest");
                throw new FetchFailedException("Failed to parse guests response.");
            }

        }
        guestUserService.createUser(new GuestUser(guestId, guestDTO.getEmailId(), token, guestDTO.isHasSubscribed()));
        return guestId;
    }

    /**
     * Cancels a booking with the provided booking ID.
     *
     * @param bookingId The booking ID.
     */
    public void cancelBooking(Long bookingId) {
        updateBooking(bookingId);
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new DataNotFoundException("Booking with given bookingId does not exist"));
            booking.setActive(false);
            bookingRepository.save(booking);
            List<Long> availabilityIdsForBookingId = getAvailabilityIdsForBookingId(bookingId);
            for (Long availabilityId : availabilityIdsForBookingId) {
                updateRoomAvailability(availabilityId, 0L);
            }
            log.info("Booking with ID {} cancelled successfully", bookingId);
        } catch (DataNotFoundException e) {
            log.error("Error occurred while cancelling booking: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error occurred while cancelling booking: {}", e.getMessage());
            throw new RuntimeException("An error occurred while cancelling booking.");
        }
    }

    public void cancelBooking(Long bookingId, String token) {
        try {
            Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new DataNotFoundException("Booking with given bookingId does not exist"));
            GuestUser user = guestUserService.getUser(booking.getGuestInfo().getEmailId());
            if(user.getToken().equals(token)) {
                updateBooking(bookingId);
                booking.setActive(false);
                bookingRepository.save(booking);
                List<Long> availabilityIdsForBookingId = getAvailabilityIdsForBookingId(bookingId);
                for (Long availabilityId : availabilityIdsForBookingId) {
                    updateRoomAvailability(availabilityId, 0L);
                }
                log.info("Booking with ID {} cancelled successfully", bookingId);
            }
            else{
                throw new UnauthorizedAccessException("Unauthorized access");
            }
        } catch (UnauthorizedAccessException e) {
            log.error("Unauthorized access to cancel booking: {}", e.getMessage());
            throw new UnauthorizedAccessException(e.getMessage());
        } catch (DataNotFoundException e) {
            log.error("Error occurred while cancelling booking: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error occurred while cancelling booking: {}", e.getMessage());
            throw new RuntimeException("An error occurred while cancelling booking.");
        }
    }

    /**
     * Retrieves the availability IDs for the provided booking ID.
     *
     * @param bookingId The booking ID.
     * @return The list of availability IDs.
     */
    private List<Long> getAvailabilityIdsForBookingId(Long bookingId) {
        try {
            log.info("Retrieving availability IDs for booking ID {}", bookingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);

            String GET_AVAILABILITIES_BY_BOOKING_ID = String.format(GraphqlQuery.GET_AVAILABILITIES_BY_BOOKING_ID,
                    bookingId);
            String requestBody = "{ \"query\": \"" + GET_AVAILABILITIES_BY_BOOKING_ID + "\" }";
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);
            List<Long> roomAvailabilities = new ArrayList<>();
            if (responseEntity.getStatusCode() == HttpStatus.OK) {
                String jsonResponse = responseEntity.getBody();
                try {
                    ObjectMapper objectMapper = new ObjectMapper();
                    JsonNode root = objectMapper.readTree(jsonResponse);
                    JsonNode roomAvailabilitiesData = root.path("data").path("listRoomAvailabilities");

                    for (JsonNode availability : roomAvailabilitiesData) {
                        long availabilityId = availability.path("availability_id").asLong();
                        roomAvailabilities.add(availabilityId);
                    }
                    log.info("Retrieved availability IDs for booking ID {}: {}", bookingId, roomAvailabilities);
                    return roomAvailabilities;
                } catch (IOException e) {
                    log.error("Failed to parse listRoomAvailabilities response: {}", e.getMessage());
                    throw new FetchFailedException("Failed to parse listRoomAvailabilities response.");
                }
            } else {
                log.error("Failed to retrieve availability IDs for booking ID {}: Unexpected status code {}", bookingId,
                        responseEntity.getStatusCodeValue());
                throw new FetchFailedException(
                        "Failed to parse listRoomAvailabilities response: Unexpected status code "
                                + responseEntity.getStatusCodeValue());
            }
        } catch (Exception e) {
            log.error("Failed to retrieve availability IDs for booking ID {}: {}", bookingId, e.getMessage());
            throw new FetchFailedException("Failed to retrieve availability IDs for booking.");
        }
    }

    /**
     * Updates the booking status based on the provided booking ID.
     *
     * @param bookingId The booking ID.
     */
    private void updateBooking(Long bookingId) {
        try {
            log.info("Updating booking with ID {}", bookingId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set(Constants.API_KEY_TITLE, apiKey);

            String UPDATE_BOOKING = String.format(GraphqlQuery.UPDATE_BOOKING, bookingId);
            String requestBody = "{ \"query\": \"" + UPDATE_BOOKING + "\" }";
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(graphqlUrl, HttpMethod.POST, requestEntity,
                    String.class);
            if (responseEntity.getStatusCode() != HttpStatus.OK) {
                log.error("Failed to update booking with ID {}: Unexpected status code {}", bookingId,
                        responseEntity.getStatusCodeValue());
                throw new RuntimeException("Failed to update booking.");
            }
            log.info("Booking with ID {} updated successfully", bookingId);
        } catch (Exception e) {
            log.error("Failed to update booking with ID {}: {}", bookingId, e.getMessage());
            throw new RuntimeException("Failed to update booking.");
        }
    }

    /**
     * Retrieves the booking details for the provided booking ID.
     *
     * @param bookingId The booking ID.
     * @return The booking response DTO.
     */
    public BookingResponseDTO getBooking(Long bookingId) {
        try {
            log.info("Fetching booking details for ID {}", bookingId);
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new DataNotFoundException("Booking with given bookingId does not exist"));
            return createBookingResponse(booking);
        } catch (DataNotFoundException e) {
            log.error("Failed to get booking with ID {}: {}", bookingId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to get booking with ID {}: {}", bookingId, e.getMessage());
            throw new FetchFailedException("Failed to get booking.");
        }
    }

    /**
     * Retrieves the bookings associated with the provided email.
     *
     * @param email The email associated with the bookings.
     * @return The my bookings response DTO.
     */
    public MyBookingsResponseDTO getMyBookings(String email, String token) {
        try {
            log.info("Fetching bookings for email {}", email);
            GuestUser user = guestUserService.getUser(email);
            if(user.getToken().equals(token)) {
                List<Booking> myBookings = bookingRepository.findBookingsByEmail(email);
                MyBookingsResponseDTO myBookingsResponseDTO = new MyBookingsResponseDTO();
                List<MyBookingsResponseDTO.MyBookingsDTO> list = new ArrayList<>();
                for (Booking booking : myBookings) {
                    list.add(new MyBookingsResponseDTO.MyBookingsDTO(booking.getBookingId(), booking.isActive(),
                            booking.getStartDate(), booking.getEndDate(), booking.getRoomCount(), booking.getRoomName()));
                }
                myBookingsResponseDTO.setMyBookings(list);
                return myBookingsResponseDTO;
            }
            else{
                throw new UnauthorizedAccessException("Unauthorized access");
            }
        } catch (UnauthorizedAccessException e) {
            log.error("Unauthorized access to get bookings for email {}: {}", email, e.getMessage());
            throw new UnauthorizedAccessException(e.getMessage());
        }
        catch (Exception e) {
            log.error("Failed to get bookings for email {}: {}", email, e.getMessage());
            throw new FetchFailedException("Failed to get bookings.");
        }
    }

    /**
     * Retrieves the booking details for review with the provided booking ID.
     *
     * @param bookingId The booking ID.
     * @return The review booking response DTO.
     */
    public ReviewBookingResponseDTO getBookingForReview(Long bookingId) {
        try {
            log.info("Fetching booking for review with ID {}", bookingId);
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new DataNotFoundException("Booking with given bookingId does not exist"));
            ReviewBookingResponseDTO reviewBookingResponseDTO = new ReviewBookingResponseDTO();
            reviewBookingResponseDTO.setTenantId(booking.getTenantId());
            reviewBookingResponseDTO.setRoomTypeId(booking.getRoomTypeId());
            reviewBookingResponseDTO.setRoomTypeName(booking.getRoomName());
            return reviewBookingResponseDTO;
        } catch (DataNotFoundException e) {
            log.error("Failed to get booking for review with ID {}: {}", bookingId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to get booking for review with ID {}: {}", bookingId, e.getMessage());
            throw new FetchFailedException("Failed to get booking for review.");
        }
    }

    /**
     * Retrieves the count of successful bookings associated with the provided
     * email.
     *
     * @param emailId The email associated with the bookings.
     * @return The successful booking response DTO.
     */
    public SuccessFulBookingResponseDTO getSuccessFulBookings(String emailId, String token) {
        try {
            log.info("Fetching successful bookings for email {}", emailId);
            GuestUser user = guestUserService.getUser(emailId);
            if(user.getToken().equals(token)) {
                LocalDate currentDate = LocalDate.now();
                long count = bookingRepository.countSuccessfulBookings(emailId, String.valueOf(currentDate));
                return new SuccessFulBookingResponseDTO(count);
            }
            else{
                throw new UnauthorizedAccessException("Unauthorized access");
            }
        }  catch (UnauthorizedAccessException e) {
            log.error("Unauthorized access to get bookings for email {}: {}", emailId, e.getMessage());
            throw new UnauthorizedAccessException(e.getMessage());
        }
        catch (Exception e) {
            log.error("Failed to get successful bookings for email {}: {}", emailId, e.getMessage());
            throw new FetchFailedException("Failed to get successful bookings.");
        }
    }

    /**
     * Deletes all bookings.
     */
    public void deleteAllBookings(Long tenantId, String secretKey) {
        try {
            log.info("Deleting all bookings");
            Tenant tenant = tenantRepository.findById(tenantId).orElseThrow(() -> new DataNotFoundException("Booking with given bookingId does not exist"));

            if(passwordEncoder.matches(secretKey, tenant.getSecretKey())){
                List<Booking> bookings = bookingRepository.findAll();
                for (Booking booking : bookings) {
                    updateBooking(booking.getBookingId());
                    List<Long> availabilityIdsForBookingId = getAvailabilityIdsForBookingId(booking.getBookingId());
                    for (Long availabilityId : availabilityIdsForBookingId) {
                        updateRoomAvailability(availabilityId, 0L);
                    }
                }
                bookingRepository.deleteAll();
                log.info("All bookings deleted successfully");
            }
            else{
                throw new UnauthorizedAccessException("Unauthorized access");
            }
        }
        catch (UnauthorizedAccessException e){
            log.error("Unauthorized access to delete all bookings: {}", e.getMessage());
            throw new UnauthorizedAccessException(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to delete all bookings: {}", e.getMessage());
            throw new UnprocessableEntityException("Failed to delete all bookings.");
        }
    }

    private BookingResponseDTO createBookingResponse(Booking booking) {
        BookingResponseDTO bookingResponseDTO = new BookingResponseDTO();
        bookingResponseDTO.setBookingId(booking.getBookingId());
        bookingResponseDTO.setActive(booking.isActive());
        bookingResponseDTO.setStartDate(booking.getStartDate());
        bookingResponseDTO.setEndDate(booking.getEndDate());
        bookingResponseDTO.setRoomCount(booking.getRoomCount());
        bookingResponseDTO.setAdultCount(booking.getAdultCount());
        bookingResponseDTO.setTeenCount(booking.getTeenCount());
        bookingResponseDTO.setSeniorCount(booking.getSeniorCount());
        bookingResponseDTO.setKidCount(booking.getKidCount());
        bookingResponseDTO.setRoomName(booking.getRoomName());
        bookingResponseDTO.setRoomImageUrl(booking.getRoomImageUrl());
        bookingResponseDTO.setTotalCost(booking.getCostInfo().getTotalCost());
        bookingResponseDTO.setAmountDueAtResort(booking.getCostInfo().getAmountDueAtResort());
        bookingResponseDTO.setNightlyRate(booking.getCostInfo().getNightlyRate());
        bookingResponseDTO.setTaxes(booking.getCostInfo().getTaxes());
        bookingResponseDTO.setVat(booking.getCostInfo().getVat());
        bookingResponseDTO.setPromotionTitle(booking.getPromotionInfo().getPromotionTitle());
        bookingResponseDTO.setPriceFactor(booking.getPromotionInfo().getPriceFactor());
        bookingResponseDTO.setPromotionDescription(booking.getPromotionInfo().getPromotionDescription());
        bookingResponseDTO.setFirstName(booking.getGuestInfo().getFirstName());
        bookingResponseDTO.setLastName(booking.getGuestInfo().getLastName());
        bookingResponseDTO.setPhone(booking.getGuestInfo().getPhone());
        bookingResponseDTO.setEmail(booking.getGuestInfo().getEmailId());
        bookingResponseDTO.setFirstNameBilling(booking.getBillingInfo().getFirstName());
        bookingResponseDTO.setLastNameBilling(booking.getBillingInfo().getLastName());
        bookingResponseDTO.setAddress1(booking.getBillingInfo().getAddress1());
        bookingResponseDTO.setAddress2(booking.getBillingInfo().getAddress2());
        bookingResponseDTO.setCity(booking.getBillingInfo().getCity());
        bookingResponseDTO.setZipcode(booking.getBillingInfo().getZipcode());
        bookingResponseDTO.setState(booking.getBillingInfo().getState());
        bookingResponseDTO.setCountry(booking.getBillingInfo().getCountry());
        bookingResponseDTO.setPhoneBilling(booking.getBillingInfo().getPhone());
        bookingResponseDTO.setEmailBilling(booking.getBillingInfo().getEmailId());
        bookingResponseDTO.setCardNumber(booking.getPaymentInfo().getCardNumber());
        bookingResponseDTO.setExpiryMonth(booking.getPaymentInfo().getExpiryMonth());
        bookingResponseDTO.setExpiryYear(booking.getPaymentInfo().getExpiryYear());

        return bookingResponseDTO;
    }

    public void checkBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new DataNotFoundException("Booking with given bookingId does not exist"));
        if(booking.isActive()){
            throw new CustomException("Booking is active");
        }
    }
}
package com.spring.ibe.service;

import com.spring.ibe.dto.request.PromotionRequestDTO;
import com.spring.ibe.dto.request.RoomDataRequestDTO;
import com.spring.ibe.dto.response.RoomDataResponseDTO;
import com.spring.ibe.dto.response.RoomPromoResponseDTO;
import com.spring.ibe.dto.response.RoomReviewResponseDTO;
import com.spring.ibe.entity.Promotion;
import com.spring.ibe.entity.RoomData;
import com.spring.ibe.entity.RoomDataId;
import com.spring.ibe.exception.custom.DataNotFoundException;
import com.spring.ibe.exception.custom.UnprocessableEntityException;
import com.spring.ibe.repository.PromotionRepository;
import com.spring.ibe.repository.RoomDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.spring.ibe.util.RoomDataConverter.*;

/**
 * Service class for managing room data operations.
 */
@Service
@Slf4j
public class RoomDataService {
    private final RoomDataRepository roomDataRepository;
    private final PromotionRepository promotionRepository;

    @Autowired
    public RoomDataService(RoomDataRepository roomDataRepository, PromotionRepository promotionRepository) {
        this.roomDataRepository = roomDataRepository;
        this.promotionRepository = promotionRepository;
    }

    /**
     * Saves room data to the repository.
     * 
     * @param roomDataRequestDTO The DTO containing room data to be saved.
     * @throws UnprocessableEntityException if the room data cannot be saved.
     */
    public void saveRoomData(RoomDataRequestDTO roomDataRequestDTO) {
        try {
            roomDataRepository.save(createRoomData(roomDataRequestDTO));
            log.info("Room data saved successfully.");
        } catch (Exception e) {
            log.error("Error saving room data: {}", e.getMessage());
            throw new UnprocessableEntityException("Cannot save room data. Please check the entity again.");
        }
    }

    /**
     * Retrieves room data by ID along with promotions.
     * 
     * @param roomTypeId          The ID of the room data.
     * @param promotionRequestDTO The DTO containing promotion request details.
     * @return The DTO containing room data and promotions.
     * @throws DataNotFoundException if no room data exists for the given ID.
     */
    public RoomDataResponseDTO getRoomDataById(long tenantId, long roomTypeId,
            PromotionRequestDTO promotionRequestDTO) {
        RoomDataId roomDataId = new RoomDataId(tenantId, roomTypeId);
        try {
            RoomData roomData = roomDataRepository.findById(roomDataId)
                    .orElseThrow(() -> new DataNotFoundException("No room data exists for the given ID."));
            log.info("Room data found for tenantId: {}, roomTypeId: {}", tenantId, roomTypeId);
            return createRoomDataResponseDTO(roomData, promotionRequestDTO);
        } catch (DataNotFoundException e) {
            log.error("Room data not found for tenantId: {}, roomTypeId: {}", tenantId, roomTypeId);
            throw e;
        }
    }

    /**
     * Retrieves promotion details for a room by ID and input promo code.
     * 
     * @param roomTypeId     The ID of the room data.
     * @param inputPromoCode The input promo code.
     * @return The DTO containing room promotion details.
     * @throws DataNotFoundException if no room data exists for the given ID.
     */
    public RoomPromoResponseDTO getPromoDetailsByRoomId(long tenantId, long roomTypeId, String inputPromoCode) {
        RoomDataId roomDataId = new RoomDataId(tenantId, roomTypeId);
        try {
            RoomData roomData = roomDataRepository.findById(roomDataId)
                    .orElseThrow(() -> new DataNotFoundException("No room data exists for the given ID."));

            if (roomData.getRoomData().getPromoCodes().contains(inputPromoCode)) {
                Promotion promotion = promotionRepository.findById(inputPromoCode)
                        .orElseThrow(() -> new DataNotFoundException("No promotion exists for the given promo code."));

                if (!promotion.isActive()) {
                    log.info("Promotion with code '{}' is inactive.", inputPromoCode);
                    return new RoomPromoResponseDTO();
                }
                return createRoomPromoResponseDTO(promotion);
            } else {
                log.info("Promotion with code '{}' is not applicable for room with tenantId: {}, roomTypeId: {}.",
                        inputPromoCode, tenantId, roomTypeId);
                return new RoomPromoResponseDTO();
            }
        } catch (DataNotFoundException e) {
            log.error("Error getting promo details: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Updates room data by ID.
     * 
     * @param roomTypeId         The ID of the room data.
     * @param roomDataRequestDTO The DTO containing updated room data.
     * @throws UnprocessableEntityException if the room data cannot be updated.
     * @throws DataNotFoundException        if no room data exists for the given ID.
     */
    public void updateRoomData(long tenantId, long roomTypeId, RoomDataRequestDTO roomDataRequestDTO) {
        RoomDataId roomDataId = new RoomDataId(tenantId, roomTypeId);
        try {
            RoomData roomData = roomDataRepository.findById(roomDataId)
                    .orElseThrow(() -> new DataNotFoundException("No room data exists for the given ID."));

            updateRoomDataHelper(roomData, roomDataRequestDTO);
            log.info("Room data updated successfully for tenantId: {}, roomTypeId: {}", tenantId, roomTypeId);
        } catch (DataNotFoundException e) {
            log.error("Error updating room data: {}", e.getMessage());
            throw e;
        }
    }

    private void updateRoomDataHelper(RoomData roomData, RoomDataRequestDTO roomDataRequestDTO)
            throws UnprocessableEntityException {
        try {
            if (roomDataRequestDTO.getImageUrls() != null) {
                roomData.getRoomData().setImageUrls(roomDataRequestDTO.getImageUrls());
            }
            if (roomDataRequestDTO.getRoomReviews() != null) {
                roomData.getRoomData().setRoomReviews(roomDataRequestDTO.getRoomReviews());
            }
            if (roomDataRequestDTO.getRoomAmenities() != null) {
                roomData.getRoomData().setRoomAmenities(roomDataRequestDTO.getRoomAmenities());
            }
            if (roomDataRequestDTO.getRoomDescription() != null) {
                roomData.getRoomData().setRoomDescription(roomDataRequestDTO.getRoomDescription());
            }
            if (roomDataRequestDTO.getPromoCodes() != null) {
                roomData.getRoomData().setPromoCodes(roomDataRequestDTO.getPromoCodes());
            }
            roomDataRepository.save(roomData);
            log.info("Room data updated successfully.");
        } catch (Exception e) {
            log.error("Error updating room data: {}", e.getMessage());
            throw new UnprocessableEntityException("Cannot update room data. Please check the entity again.");
        }
    }

    /**
     * Posts a review for a room by ID.
     * 
     * @param roomTypeId The ID of the room data.
     * @param reviewDTO  The DTO containing the review details.
     * @throws DataNotFoundException if no room data exists for the given ID.
     */
    public void postReviewByRoomId(long tenantId, long roomTypeId, String username,
            RoomDataRequestDTO.ReviewDTO reviewDTO) {
        RoomDataId roomDataId = new RoomDataId(tenantId, roomTypeId);
        try {
            RoomData roomData = roomDataRepository.findById(roomDataId)
                    .orElseThrow(() -> new DataNotFoundException("No room data exists for the given ID."));

            addReviewToRoom(roomData, username, reviewDTO);
            roomDataRepository.save(roomData);
            log.info("Review posted successfully for room with tenantId: {}, roomTypeId: {} by user: {}", tenantId,
                    roomTypeId, username);
        } catch (DataNotFoundException e) {
            log.error("Error posting review: {}", e.getMessage());
            throw e;
        }
    }

    public RoomReviewResponseDTO getReviewByRoomId(long tenantId, long roomTypeId) {
        RoomDataId roomDataId = new RoomDataId(tenantId, roomTypeId);
        try {
            Optional<RoomData> optionalRoomData = roomDataRepository.findById(roomDataId);
            List<RoomReviewResponseDTO.RoomReviewDTO> roomReviewDTOs = new ArrayList<>();

            if (optionalRoomData.isPresent()) {
                RoomData roomData = optionalRoomData.get();
                RoomData.InnerRoomData innerRoomData = roomData.getRoomData();
                Map<String, RoomDataRequestDTO.ReviewDTO> roomReviews = innerRoomData.getRoomReviews();
                for (Map.Entry<String, RoomDataRequestDTO.ReviewDTO> entry : roomReviews.entrySet()) {
                    String username = entry.getKey();
                    RoomDataRequestDTO.ReviewDTO reviewDTO = entry.getValue();

                    RoomReviewResponseDTO.RoomReviewDTO roomReviewDTO = new RoomReviewResponseDTO.RoomReviewDTO();
                    roomReviewDTO.setUsername(username);
                    roomReviewDTO.setReview(reviewDTO.getReview());
                    roomReviewDTO.setRating(reviewDTO.getRating());
                    roomReviewDTOs.add(roomReviewDTO);
                }
            } else {
                log.info("No room data found for tenantId: {}, roomTypeId: {}", tenantId, roomTypeId);
            }
            return new RoomReviewResponseDTO(roomReviewDTOs);
        } catch (Exception e) {
            log.error("Error getting reviews for room with tenantId: {}, roomTypeId: {}", tenantId, roomTypeId, e);
            throw e;
        }
    }
}

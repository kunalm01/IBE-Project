package com.spring.ibe.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.spring.ibe.dto.request.PromotionRequestDTO;
import com.spring.ibe.dto.request.RoomDataRequestDTO;
import com.spring.ibe.dto.response.PromotionResponseDTO;
import com.spring.ibe.dto.response.RoomDataResponseDTO;
import com.spring.ibe.dto.response.RoomPromoResponseDTO;
import com.spring.ibe.entity.Promotion;
import com.spring.ibe.entity.RoomData;
import com.spring.ibe.exception.custom.UnprocessableEntityException;
import com.spring.ibe.service.PromotionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.io.IOException;
import java.util.Map;

/**
 * Attribute converter and utility methods for converting RoomData entities.
 */
@Converter(autoApply = true)
public class RoomDataConverter implements AttributeConverter<RoomData.InnerRoomData, String> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(RoomData.InnerRoomData roomData) {
        try {
            return objectMapper.writeValueAsString(roomData);
        } catch (Exception e) {
            throw new UnprocessableEntityException("Error converting RoomImages to JSON");
        }
    }

    @Override
    public RoomData.InnerRoomData convertToEntityAttribute(String json) {
        try {
            return objectMapper.readValue(json, RoomData.InnerRoomData.class);
        } catch (IOException e) {
            throw new UnprocessableEntityException("Error converting JSON to RoomImages");
        }
    }

    /**
     * Creates a response DTO for room data based on the given room data and
     * promotion request DTO.
     * 
     * @param roomData            The room data entity.
     * @param promotionRequestDTO The promotion request DTO.
     * @return The response DTO containing room data.
     */
    public static RoomDataResponseDTO createRoomDataResponseDTO(RoomData roomData,
            PromotionRequestDTO promotionRequestDTO) {
        RoomData.InnerRoomData innerRoomData = roomData.getRoomData();
        RoomDataResponseDTO dto = new RoomDataResponseDTO();
        PromotionResponseDTO promotionResponseDTO = PromotionService.getPromotions(promotionRequestDTO);

        PromotionResponseDTO.Promotion bestPromotion = promotionResponseDTO.getPromotions().stream()
                .min(java.util.Comparator.comparingDouble(PromotionResponseDTO.Promotion::getPriceFactor))
                .orElse(new PromotionResponseDTO.Promotion());

        dto.setBestPromotion(bestPromotion);
        dto.setTotalReviews(innerRoomData.getRoomReviews().size());
        dto.setRoomDescription(innerRoomData.getRoomDescription());
        dto.setRoomAmenities(innerRoomData.getRoomAmenities());
        dto.setRoomImages(innerRoomData.getImageUrls());
        dto.setRating(innerRoomData.getRating());

        return dto;
    }

    /**
     * Calculates the average rating based on the list of reviews.
     * 
     * @param roomReviews The list of review DTOs.
     * @return The average rating.
     */
    public static double calculateAverageRating(Map<String, RoomDataRequestDTO.ReviewDTO> roomReviews) {
        return roomReviews.values().stream()
                .mapToDouble(RoomDataRequestDTO.ReviewDTO::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * Creates a RoomData entity based on the given DTO.
     * 
     * @param dto The room data request DTO.
     * @return The created RoomData entity.
     */
    public static RoomData createRoomData(RoomDataRequestDTO dto) {
        RoomData roomData = new RoomData();
        RoomData.InnerRoomData innerRoomData = new RoomData.InnerRoomData();

        innerRoomData.setImageUrls(dto.getImageUrls());
        innerRoomData.setRoomReviews(dto.getRoomReviews());
        innerRoomData.setPromoCodes(dto.getPromoCodes());
        innerRoomData.setRoomDescription(dto.getRoomDescription());
        innerRoomData.setRoomAmenities(dto.getRoomAmenities());
        innerRoomData.setRating(calculateAverageRating(dto.getRoomReviews()));

        roomData.setRoomTypeId(dto.getRoomTypeId());
        roomData.setTenantId(dto.getTenantId());
        roomData.setRoomData(innerRoomData);

        return roomData;
    }

    /**
     * Creates a response DTO for room promotions based on the given room data and
     * promo code.
     * 
     * @param promotion The input promo code.
     * @return The response DTO containing room promotions.
     */
    public static RoomPromoResponseDTO createRoomPromoResponseDTO(Promotion promotion) {
        RoomPromoResponseDTO dto = new RoomPromoResponseDTO();

        dto.setPromoTitle(promotion.getTitle());
        dto.setDescription(promotion.getDescription());
        dto.setPromoPriceFactor(promotion.getPriceFactor());

        return dto;
    }

    /**
     * Adds a review to the room data entity.
     * 
     * @param roomData  The room data entity.
     * @param reviewDTO The review DTO to be added.
     * @return The updated room data entity.
     */
    public static RoomData.InnerRoomData addReviewToRoom(RoomData roomData, String username,
            RoomDataRequestDTO.ReviewDTO reviewDTO) {
        RoomData.InnerRoomData innerRoomData = roomData.getRoomData();
        double newAverageRating;

        if (innerRoomData.getRoomReviews().containsKey(username)) {
            double previousRating = innerRoomData.getRoomReviews().get(username).getRating();

            newAverageRating = innerRoomData.getRating() * innerRoomData.getRoomReviews().size();
            newAverageRating -= previousRating;
            newAverageRating += reviewDTO.getRating();
        } else {
            newAverageRating = innerRoomData.getRating() * innerRoomData.getRoomReviews().size();
            newAverageRating += reviewDTO.getRating();
        }

        innerRoomData.getRoomReviews().put(username, reviewDTO);

        double updatedRating = newAverageRating / innerRoomData.getRoomReviews().size();
        innerRoomData.setRating(Math.round(updatedRating * 10.0) / 10.0);

        roomData.setRoomData(innerRoomData);
        return innerRoomData;
    }
}

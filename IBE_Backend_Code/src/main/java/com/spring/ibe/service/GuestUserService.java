package com.spring.ibe.service;

import com.spring.ibe.dto.request.GuestUserRequestDTO;
import com.spring.ibe.entity.GuestUser;
import com.spring.ibe.exception.custom.DataNotFoundException;
import com.spring.ibe.repository.GuestUserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * Service class for handling guest user-related operations.
 */
@Service
@Slf4j
public class GuestUserService {
    private GuestUserRepository guestUserRepository;

    /**
     * Constructor for initializing the GuestUserService.
     *
     * @param guestUserRepository The repository for guest users.
     */
    @Autowired
    public GuestUserService(GuestUserRepository guestUserRepository) {
        this.guestUserRepository = guestUserRepository;
    }

    /**
     * Retrieves all guest users.
     *
     * @return The list of all guest users.
     */
    public List<GuestUser> getAllUsers() {
        log.info("Retrieving all guest users");
        return guestUserRepository.findAll();
    }

    /**
     * Creates a new guest user.
     *
     * @param guestUser The GuestUser object to be created.
     */
    public void createUser(GuestUser guestUser) {
        guestUserRepository.save(guestUser);
        log.info("Guest user created: {}", guestUser);
    }

    public void updateUser(GuestUserRequestDTO guestUserRequestDTO) {
        try {
            GuestUser guestUser = guestUserRepository.findByEmailId(guestUserRequestDTO.getEmailId());
            if(Objects.isNull(guestUser)){
                throw new DataNotFoundException("User not found");
            }
            else{
                guestUser.setToken(guestUserRequestDTO.getToken());
                guestUserRepository.save(guestUser);
                log.info("User updated: {}", guestUser);
            }
        }
        catch (DataNotFoundException e){
            throw new DataNotFoundException(e.getMessage());
        }
    }

    public GuestUser getUser(String email) {
        try {
            GuestUser guestUser = guestUserRepository.findByEmailId(email);
            if(Objects.isNull(guestUser)){
                throw new DataNotFoundException("User not found");
            }
            log.info("User fetched: {}", guestUser);
            return guestUser;
        }
        catch (DataNotFoundException e){
            throw new DataNotFoundException(e.getMessage());
        }
    }
}

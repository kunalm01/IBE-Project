package com.spring.ibe.repository;

import com.spring.ibe.entity.RoomData;
import com.spring.ibe.entity.RoomDataId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomDataRepository extends JpaRepository<RoomData, RoomDataId> {
}

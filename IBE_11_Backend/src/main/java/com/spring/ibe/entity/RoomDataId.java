package com.spring.ibe.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomDataId implements Serializable {
    private long tenantId;
    private long roomTypeId;
}

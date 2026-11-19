package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.UserResponseDTO;
import com.libraryhub.libraryhub.entity.User;

public class UserMapper {

    public static UserResponseDTO toDTO(User user) {

        UserResponseDTO dto = new UserResponseDTO();

        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getRoleId());
            dto.setRoleName(user.getRole().getRoleName());
        }

        return dto;
    }
}
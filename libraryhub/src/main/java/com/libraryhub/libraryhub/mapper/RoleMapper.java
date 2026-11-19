package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.RoleResponseDTO;
import com.libraryhub.libraryhub.entity.Role;

public class RoleMapper {

    public static RoleResponseDTO toDTO(Role role) {

        return new RoleResponseDTO(
                role.getRoleId(),
                role.getRoleName()
        );
    }
}
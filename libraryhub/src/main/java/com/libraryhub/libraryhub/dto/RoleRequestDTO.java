package com.libraryhub.libraryhub.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RoleRequestDTO {

	@NotBlank(message = "Role name cannot be empty")
	@Size(max = 30, message = "Role name cannot exceed 30 characters")
	private String roleName;

    public RoleRequestDTO() {
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}
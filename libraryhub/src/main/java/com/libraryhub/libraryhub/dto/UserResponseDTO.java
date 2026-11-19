package com.libraryhub.libraryhub.dto;

import java.time.LocalDateTime;

public class UserResponseDTO {

    private Long userId;
    private String name;
    private String email;
    private String phone;
    private Long roleId;
    private String roleName;
    private LocalDateTime createdAt;

    public UserResponseDTO() {
    }

    public UserResponseDTO(
            Long userId,
            String name,
            String email,
            String phone,
            Long roleId,
            String roleName,
            LocalDateTime createdAt) {

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.roleId = roleId;
        this.roleName = roleName;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
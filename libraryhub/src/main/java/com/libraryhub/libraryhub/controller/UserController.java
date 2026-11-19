
package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.UserRequestDTO;
import com.libraryhub.libraryhub.dto.UserResponseDTO;
import com.libraryhub.libraryhub.dto.ProfileUpdateRequestDTO;
import com.libraryhub.libraryhub.dto.ChangePasswordRequestDTO;

import com.libraryhub.libraryhub.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Constructor injection
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public UserResponseDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Register a new member
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO registerUser(
            @Valid @RequestBody UserRequestDTO request) {

        return userService.registerUser(request);
    }

    // Update user details (existing admin functionality)
    @PutMapping("/{id}")
    public UserResponseDTO updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDTO request) {

        return userService.updateUser(id, request);
    }

    // Delete a user
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // ================================================
    // MEMBER PROFILE ENDPOINTS
    // ================================================

    // Get logged-in user's profile
    @GetMapping("/me")
    public UserResponseDTO getMyProfile(Authentication authentication) {

        return userService.getMyProfile(authentication.getName());
    }

    // Update logged-in user's profile
    @PutMapping("/me")
    public UserResponseDTO updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequestDTO request) {

        return userService.updateMyProfile(
                authentication.getName(),
                request
        );
    }

    // Change logged-in user's password
    @PatchMapping("/me/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changeMyPassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO request) {

        userService.changeMyPassword(
                authentication.getName(),
                request
        );
    }
}

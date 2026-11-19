
package com.libraryhub.libraryhub.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.dto.UserRequestDTO;
import com.libraryhub.libraryhub.dto.UserResponseDTO;
import com.libraryhub.libraryhub.dto.ProfileUpdateRequestDTO;
import com.libraryhub.libraryhub.dto.ChangePasswordRequestDTO;

import com.libraryhub.libraryhub.entity.Role;
import com.libraryhub.libraryhub.entity.User;

import com.libraryhub.libraryhub.exception.ResourceNotFoundException;

import com.libraryhub.libraryhub.mapper.UserMapper;

import com.libraryhub.libraryhub.repository.RoleRepository;
import com.libraryhub.libraryhub.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor injection
    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get all users
    public List<UserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get user by ID
    public UserResponseDTO getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + id));

        return UserMapper.toDTO(user);
    }

    // Register a new member
    @Transactional
    public UserResponseDTO registerUser(UserRequestDTO request) {

        Role memberRole = roleRepository.findByRoleName("MEMBER")
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MEMBER role not found in database"));

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Hash password before saving
        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        user.setPhone(request.getPhone());
        user.setRole(memberRole);

        User savedUser = userRepository.save(user);

        return UserMapper.toDTO(savedUser);
    }

    // Update an existing user (existing admin functionality)
    @Transactional
    public UserResponseDTO updateUser(
            Long id, UserRequestDTO request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + id));

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setPassword(
                passwordEncoder.encode(request.getPassword()));

        User updatedUser = userRepository.save(user);

        return UserMapper.toDTO(updatedUser);
    }

    // Delete a user
    @Transactional
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + id));

        userRepository.delete(user);
    }

    // ================================================
    // MEMBER PROFILE MANAGEMENT
    // ================================================

    // Get currently logged-in member's profile
    public UserResponseDTO getMyProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));

        return UserMapper.toDTO(user);
    }

    // Update logged-in member's name and phone
    @Transactional
    public UserResponseDTO updateMyProfile(
            String email,
            ProfileUpdateRequestDTO request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));

        // Update only allowed profile fields
        user.setName(request.getName().trim());

        String phone = request.getPhone();

        user.setPhone(
                phone == null || phone.isBlank()
                        ? null
                        : phone.trim()
        );

        // Email, password and role remain unchanged
        User updatedUser = userRepository.save(user);

        return UserMapper.toDTO(updatedUser);
    }

    // Change password for currently logged-in member
    @Transactional
    public void changeMyPassword(
            String email,
            ChangePasswordRequestDTO request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));

        // Verify the current password against BCrypt hash
        boolean currentPasswordMatches = passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword()
        );

        if (!currentPasswordMatches) {
            throw new IllegalArgumentException(
                    "Current password is incorrect");
        }

        // Prevent reusing the existing password
        boolean samePassword = passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword()
        );

        if (samePassword) {
            throw new IllegalArgumentException(
                    "New password must be different from current password");
        }

        // Hash and save the new password
        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);
    }
}

package com.libraryhub.libraryhub.service;

import java.util.List;

import java.util.stream.Collectors;
import com.libraryhub.libraryhub.dto.RoleRequestDTO;
import com.libraryhub.libraryhub.dto.RoleResponseDTO;
import com.libraryhub.libraryhub.mapper.RoleMapper;

import org.springframework.stereotype.Service;

import com.libraryhub.libraryhub.entity.Role;
import com.libraryhub.libraryhub.repository.RoleRepository;

import com.libraryhub.libraryhub.exception.ResourceNotFoundException;

import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    // Constructor Injection
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    // Get all roles
    @Transactional(readOnly = true)
    public List<RoleResponseDTO> getAllRoles() {

        return roleRepository.findAll()
                .stream()
                .map(RoleMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get role by ID
    @Transactional(readOnly = true)
    public RoleResponseDTO getRoleById(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Role not found with ID: " + id));

        return RoleMapper.toDTO(role);
    }
    
    // Save a new role
    @Transactional
    public RoleResponseDTO saveRole(RoleRequestDTO request) {

        Role role = new Role();

        role.setRoleName(request.getRoleName());

        Role savedRole = roleRepository.save(role);

        return RoleMapper.toDTO(savedRole);
    }
    public RoleResponseDTO updateRole(Long id, RoleRequestDTO request) {

        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        existingRole.setRoleName(request.getRoleName());

        Role updatedRole = roleRepository.save(existingRole);

        return RoleMapper.toDTO(updatedRole);
    }
    public void deleteRole(Long id) {

        if (!roleRepository.existsById(id)) {
            throw new RuntimeException("Role not found");
        }

        roleRepository.deleteById(id);
    }
}
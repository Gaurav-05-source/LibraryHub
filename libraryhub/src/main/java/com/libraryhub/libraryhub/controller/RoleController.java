package com.libraryhub.libraryhub.controller;

import java.util.List;
import com.libraryhub.libraryhub.dto.RoleRequestDTO;
import com.libraryhub.libraryhub.dto.RoleResponseDTO;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.libraryhub.libraryhub.dto.RoleResponseDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import jakarta.validation.Valid;
import com.libraryhub.libraryhub.entity.Role;
import com.libraryhub.libraryhub.service.RoleService;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public List<RoleResponseDTO> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    public RoleResponseDTO getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id);
    }

    @PostMapping
    public RoleResponseDTO createRole(@Valid @RequestBody RoleRequestDTO request) {
        return roleService.saveRole(request);
    }
    @PutMapping("/{id}")
    public RoleResponseDTO updateRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequestDTO request) {

        return roleService.updateRole(id, request);
    }
    @DeleteMapping("/{id}")
    public String deleteRole(@PathVariable Long id) {
        roleService.deleteRole(id);
        return "Role deleted successfully";
    }
}
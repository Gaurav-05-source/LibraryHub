
package com.libraryhub.libraryhub.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.LoginRequestDTO;
import com.libraryhub.libraryhub.dto.LoginResponseDTO;
import com.libraryhub.libraryhub.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request) {

        LoginResponseDTO response = authService.login(request);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}

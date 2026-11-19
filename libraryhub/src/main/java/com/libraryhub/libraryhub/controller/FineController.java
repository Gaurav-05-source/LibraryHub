
package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.libraryhub.libraryhub.dto.FineResponseDTO;
import com.libraryhub.libraryhub.service.FineService;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    // ADMIN: Get all fines
    // MEMBER: Get only their own fines
    @GetMapping
    public List<FineResponseDTO> getFines(
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean isAdmin = isAdmin(userDetails);

        if (isAdmin) {
            return fineService.getAllFines();
        }

        return fineService.getMyFines(userDetails.getUsername());
    }

    // MEMBER: Get their own fine history
    @GetMapping("/my-fines")
    public List<FineResponseDTO> getMyFines(
            @AuthenticationPrincipal UserDetails userDetails) {

        return fineService.getMyFines(userDetails.getUsername());
    }

    // ADMIN or fine owner: Get fine by ID
    @GetMapping("/{id}")
    public FineResponseDTO getFineById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return fineService.getFineById(
                id,
                userDetails.getUsername(),
                isAdmin(userDetails));
    }

    // ADMIN only: Generate fine
    @PostMapping("/generate/{borrowId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FineResponseDTO generateFine(
            @PathVariable Long borrowId) {

        return fineService.generateFine(borrowId);
    }

    // ADMIN only: Mark fine as paid
    @PatchMapping("/{id}/pay")
    public FineResponseDTO markFineAsPaid(
            @PathVariable Long id) {

        return fineService.markFineAsPaid(id);
    }

    // ADMIN only: Waive fine
    @PatchMapping("/{id}/waive")
    public FineResponseDTO waiveFine(
            @PathVariable Long id) {

        return fineService.waiveFine(id);
    }

    // Check logged-in user's role
    private boolean isAdmin(UserDetails userDetails) {

        return userDetails.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }
}

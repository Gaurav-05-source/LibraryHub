
package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.ReservationRequestDTO;
import com.libraryhub.libraryhub.dto.ReservationResponseDTO;
import com.libraryhub.libraryhub.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    // ADMIN: Get all reservations
    // MEMBER: Get only their own reservations
    @GetMapping
    public List<ReservationResponseDTO> getReservations(
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean isAdmin = isAdmin(userDetails);

        if (isAdmin) {
            return reservationService.getAllReservations();
        }

        return reservationService.getMyReservations(
                userDetails.getUsername());
    }

    // ADMIN or reservation owner: Get reservation by ID
    @GetMapping("/{id}")
    public ReservationResponseDTO getReservationById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return reservationService.getReservationById(
                id,
                userDetails.getUsername(),
                isAdmin(userDetails));
    }

    // Create reservation for logged-in user
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponseDTO createReservation(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReservationRequestDTO request) {

        return reservationService.createReservation(
                userDetails.getUsername(), request);
    }

    // ADMIN or reservation owner: Cancel reservation
    @PatchMapping("/{id}/cancel")
    public ReservationResponseDTO cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return reservationService.cancelReservation(
                id,
                userDetails.getUsername(),
                isAdmin(userDetails));
    }

    // Check whether logged-in user has ADMIN role
    private boolean isAdmin(UserDetails userDetails) {

        return userDetails.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }
}


package com.libraryhub.libraryhub.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.dto.ReservationRequestDTO;
import com.libraryhub.libraryhub.dto.ReservationResponseDTO;
import com.libraryhub.libraryhub.entity.Book;
import com.libraryhub.libraryhub.entity.Reservation;
import com.libraryhub.libraryhub.entity.User;
import com.libraryhub.libraryhub.exception.ResourceNotFoundException;
import com.libraryhub.libraryhub.mapper.ReservationMapper;
import com.libraryhub.libraryhub.repository.BookRepository;
import com.libraryhub.libraryhub.repository.ReservationRepository;
import com.libraryhub.libraryhub.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class ReservationService {

    private static final Set<String> ACTIVE_STATUSES =
            Set.of("PENDING", "READY_FOR_PICKUP");

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ReservationQueueService reservationQueueService;

    public ReservationService(
            ReservationRepository reservationRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            ReservationQueueService reservationQueueService) {

        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.reservationQueueService = reservationQueueService;
    }

    // ADMIN: Get all reservations
    public List<ReservationResponseDTO> getAllReservations() {

        return reservationRepository.findAll()
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ADMIN or MEMBER: Get reservations belonging to logged-in member
    public List<ReservationResponseDTO> getMyReservations(String email) {

        return reservationRepository.findByUser_Email(email)
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ADMIN or reservation owner: Get reservation by ID
    public ReservationResponseDTO getReservationById(
            Long id, String email, boolean isAdmin) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found with ID: " + id));

        checkOwnership(reservation, email, isAdmin);

        return ReservationMapper.toDTO(reservation);
    }

    // Create reservation for authenticated user
    @Transactional
    public ReservationResponseDTO createReservation(
            String email, ReservationRequestDTO request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with ID: " + request.getBookId()));

        boolean alreadyReserved =
                reservationRepository.existsActiveReservation(
                        user.getUserId(),
                        request.getBookId(),
                        ACTIVE_STATUSES);

        if (alreadyReserved) {
            throw new IllegalArgumentException(
                    "You already have an active reservation for this book.");
        }

        Reservation reservation = new Reservation();

        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setExpiryDate(null);
        reservation.setStatus("PENDING");

        Reservation savedReservation =
                reservationRepository.save(reservation);

        // Allocate available copies to waiting members in queue order
        reservationQueueService.allocateAvailableCopies(
                book.getBookId());

        // Return the updated reservation
        return ReservationMapper.toDTO(savedReservation);
    }

    // ADMIN or reservation owner: Cancel a pending reservation
    @Transactional
    public ReservationResponseDTO cancelReservation(
            Long id, String email, boolean isAdmin) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reservation not found with ID: " + id));

        checkOwnership(reservation, email, isAdmin);

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending reservations can be cancelled.");
        }

        reservation.setStatus("CANCELLED");

        Reservation updatedReservation =
                reservationRepository.save(reservation);

        return ReservationMapper.toDTO(updatedReservation);
    }

    // Verify whether logged-in user owns the reservation
    private void checkOwnership(
            Reservation reservation, String email, boolean isAdmin) {

        if (isAdmin) {
            return;
        }

        if (!reservation.getUser().getEmail().equals(email)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not allowed to access this reservation.");
        }
    }
}

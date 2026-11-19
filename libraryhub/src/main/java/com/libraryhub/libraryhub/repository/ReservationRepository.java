
package com.libraryhub.libraryhub.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.libraryhub.libraryhub.entity.Reservation;

import jakarta.persistence.LockModeType;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository
        extends JpaRepository<Reservation, Long> {

    // Check whether a member already has an active reservation
    @Query("""
            SELECT COUNT(r) > 0
            FROM Reservation r
            WHERE r.user.userId = :userId
            AND r.book.bookId = :bookId
            AND r.status IN :statuses
            """)
    boolean existsActiveReservation(
            @Param("userId") Long userId,
            @Param("bookId") Long bookId,
            @Param("statuses") Collection<String> statuses);

    // Find reservations belonging to a member
    List<Reservation> findByUser_Email(String email);
    
    long countByUser_EmailAndStatusIn(
            String email,
            Collection<String> statuses
    );

    // Find and lock the oldest pending reservation for a book
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Reservation>
    findFirstByBook_BookIdAndStatusOrderByReservationDateAscReservationIdAsc(
            Long bookId, String status);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<Reservation>
    findAllByStatusAndExpiryDateLessThanEqualOrderByExpiryDateAscReservationIdAsc(
            String status, LocalDateTime expiryDate);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reservation r WHERE r.reservationId = :id")
    Optional<Reservation> findByIdForUpdate(@Param("id") Long id);
}

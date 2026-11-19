
package com.libraryhub.libraryhub.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.entity.BookCopy;
import com.libraryhub.libraryhub.entity.Reservation;
import com.libraryhub.libraryhub.repository.BookCopyRepository;
import com.libraryhub.libraryhub.repository.ReservationRepository;

@Service
@Transactional(readOnly = true)
public class ReservationQueueService {

    private static final int PICKUP_WINDOW_DAYS = 2;

    private final ReservationRepository reservationRepository;
    private final BookCopyRepository bookCopyRepository;

    public ReservationQueueService(
            ReservationRepository reservationRepository,
            BookCopyRepository bookCopyRepository) {

        this.reservationRepository = reservationRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    // Allocate an available copy to the oldest pending reservation
    @Transactional
    public void allocateNextReservation(Long bookId) {

        Reservation reservation = reservationRepository
                .findFirstByBook_BookIdAndStatusOrderByReservationDateAscReservationIdAsc(
                        bookId, "PENDING")
                .orElse(null);

        if (reservation == null) {
            return;
        }

        BookCopy copy = bookCopyRepository
                .findFirstByBook_BookIdAndStatusOrderByCopyIdAsc(
                        bookId, "AVAILABLE")
                .orElse(null);

        if (copy == null) {
            return;
        }

        reservation.setAssignedCopy(copy);
        reservation.setStatus("READY_FOR_PICKUP");

        reservation.setExpiryDate(
                LocalDateTime.now().plusDays(PICKUP_WINDOW_DAYS));

        copy.setStatus("RESERVED");

        reservationRepository.save(reservation);
        bookCopyRepository.save(copy);
    }

    // Automatically expire reservations whose pickup window has passed
    @Transactional
    public void expireReservations() {

        LocalDateTime now = LocalDateTime.now();

        List<Reservation> expiredReservations =
                reservationRepository
                .findAllByStatusAndExpiryDateLessThanEqualOrderByExpiryDateAscReservationIdAsc(
                        "READY_FOR_PICKUP", now);

        for (Reservation reservation : expiredReservations) {

            // Mark reservation as expired
            reservation.setStatus("EXPIRED");

            Long bookId = reservation.getBook().getBookId();

            // Release its assigned physical copy
            BookCopy copy = reservation.getAssignedCopy();

            if (copy != null && "RESERVED".equals(copy.getStatus())) {

                copy.setStatus("AVAILABLE");

                bookCopyRepository.save(copy);

                // Give the released copy to the next member
                allocateNextReservation(bookId);
            }

            reservationRepository.save(reservation);
        }
    }
 // Allocate all available copies to pending reservations
    @Transactional
    public void allocateAvailableCopies(Long bookId) {

        while (true) {

            Reservation reservation = reservationRepository
                    .findFirstByBook_BookIdAndStatusOrderByReservationDateAscReservationIdAsc(
                            bookId, "PENDING")
                    .orElse(null);

            if (reservation == null) {
                return;
            }

            BookCopy copy = bookCopyRepository
                    .findFirstByBook_BookIdAndStatusOrderByCopyIdAsc(
                            bookId, "AVAILABLE")
                    .orElse(null);

            if (copy == null) {
                return;
            }

            reservation.setAssignedCopy(copy);
            reservation.setStatus("READY_FOR_PICKUP");
            reservation.setExpiryDate(
                    LocalDateTime.now().plusDays(PICKUP_WINDOW_DAYS));

            copy.setStatus("RESERVED");

            reservationRepository.save(reservation);
            bookCopyRepository.save(copy);
        }
    }
}

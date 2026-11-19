
package com.libraryhub.libraryhub.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.dto.MemberDashboardDTO;
import com.libraryhub.libraryhub.repository.BorrowRecordRepository;
import com.libraryhub.libraryhub.repository.FineRepository;
import com.libraryhub.libraryhub.repository.ReservationRepository;

@Service
public class DashboardService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;

    public DashboardService(
            BorrowRecordRepository borrowRecordRepository,
            ReservationRepository reservationRepository,
            FineRepository fineRepository) {

        this.borrowRecordRepository = borrowRecordRepository;
        this.reservationRepository = reservationRepository;
        this.fineRepository = fineRepository;
    }

    @Transactional(readOnly = true)
    public MemberDashboardDTO getMemberDashboard(String email) {

        // 1. Count active borrowed books
        long borrowedBooks =
                borrowRecordRepository.countByUser_EmailAndStatusIn(
                        email,
                        List.of("ISSUED", "OVERDUE")
                );

        // 2. Count pending reservations
        long pendingReservations =
                reservationRepository.countByUser_EmailAndStatusIn(
                        email,
                        List.of("PENDING", "READY_FOR_PICKUP")
                );

        // 3. Count books due within the next 3 days
        LocalDate today = LocalDate.now();
        LocalDate dueSoonDate = today.plusDays(3);

        long dueSoon =
                borrowRecordRepository.countByUser_EmailAndStatusAndDueDateBetween(
                        email,
                        "ISSUED",
                        today,
                        dueSoonDate
                );

        // 4. Calculate total unpaid fines
        BigDecimal pendingFines =
                fineRepository.calculatePendingFines(
                        email,
                        "UNPAID"
                );

        // Return all dashboard statistics
        return new MemberDashboardDTO(
                borrowedBooks,
                pendingReservations,
                dueSoon,
                pendingFines
        );
    }
}

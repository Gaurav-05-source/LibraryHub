
package com.libraryhub.libraryhub.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.libraryhub.libraryhub.dto.FineResponseDTO;
import com.libraryhub.libraryhub.entity.BorrowRecord;
import com.libraryhub.libraryhub.entity.Fine;
import com.libraryhub.libraryhub.exception.ResourceNotFoundException;
import com.libraryhub.libraryhub.mapper.FineMapper;
import com.libraryhub.libraryhub.repository.BorrowRecordRepository;
import com.libraryhub.libraryhub.repository.FineRepository;

@Service
@Transactional(readOnly = true)
public class FineService {

    private static final BigDecimal FINE_PER_DAY =
            new BigDecimal("5.00");

    private final FineRepository fineRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public FineService(
            FineRepository fineRepository,
            BorrowRecordRepository borrowRecordRepository) {

        this.fineRepository = fineRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    // ADMIN: Get all fines
    public List<FineResponseDTO> getAllFines() {

        return fineRepository.findAll()
                .stream()
                .map(FineMapper::toDTO)
                .collect(Collectors.toList());
    }

    // MEMBER: Get only their own fines
    public List<FineResponseDTO> getMyFines(String email) {

        return fineRepository.findByBorrowRecord_User_Email(email)
                .stream()
                .map(FineMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ADMIN or fine owner: Get fine by ID
    public FineResponseDTO getFineById(
            Long id, String email, boolean isAdmin) {

        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fine not found with ID: " + id));

        checkOwnership(fine, email, isAdmin);

        return FineMapper.toDTO(fine);
    }

    // ADMIN: Generate fine manually
    @Transactional
    public FineResponseDTO generateFine(Long borrowId) {

        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Borrow record not found with ID: " + borrowId));

        if (!"RETURNED".equals(record.getStatus())) {
            throw new IllegalArgumentException(
                    "Fine can only be generated after the book is returned.");
        }

        if (fineRepository.existsByBorrowRecord_BorrowId(borrowId)) {
            throw new IllegalArgumentException(
                    "Fine already exists for this borrowing record.");
        }

        long overdueDays = ChronoUnit.DAYS.between(
                record.getDueDate(),
                record.getReturnDate());

        if (overdueDays <= 0) {
            throw new IllegalArgumentException(
                    "No fine applicable. The book was returned on time.");
        }

        return createFine(record, overdueDays);
    }

    // Automatically generate fine when an overdue book is returned
    @Transactional
    public void generateFineIfOverdue(BorrowRecord record) {

        long overdueDays = ChronoUnit.DAYS.between(
                record.getDueDate(),
                record.getReturnDate());

        // No fine if the book is returned on or before its due date
        if (overdueDays <= 0) {
            return;
        }

        // Prevent duplicate fine generation
        if (fineRepository.existsByBorrowRecord_BorrowId(
                record.getBorrowId())) {
            return;
        }

        createFine(record, overdueDays);
    }

    // Common fine creation logic
    private FineResponseDTO createFine(
            BorrowRecord record, long overdueDays) {

        BigDecimal amount = FINE_PER_DAY.multiply(
                BigDecimal.valueOf(overdueDays));

        Fine fine = new Fine();

        fine.setBorrowRecord(record);
        fine.setAmount(amount);
        fine.setPaymentStatus("UNPAID");
        fine.setCreatedAt(LocalDateTime.now());

        Fine savedFine = fineRepository.save(fine);

        return FineMapper.toDTO(savedFine);
    }

    // ADMIN only: Mark fine as paid
    @Transactional
    public FineResponseDTO markFineAsPaid(Long id) {

        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fine not found with ID: " + id));

        if (!"UNPAID".equals(fine.getPaymentStatus())) {
            throw new IllegalArgumentException(
                    "Only unpaid fines can be marked as paid.");
        }

        fine.setPaymentStatus("PAID");
        fine.setPaidAt(LocalDateTime.now());

        Fine updatedFine = fineRepository.save(fine);

        return FineMapper.toDTO(updatedFine);
    }

    // ADMIN only: Waive fine
    @Transactional
    public FineResponseDTO waiveFine(Long id) {

        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Fine not found with ID: " + id));

        if (!"UNPAID".equals(fine.getPaymentStatus())) {
            throw new IllegalArgumentException(
                    "Only unpaid fines can be waived.");
        }

        fine.setPaymentStatus("WAIVED");

        Fine updatedFine = fineRepository.save(fine);

        return FineMapper.toDTO(updatedFine);
    }

    // Check whether the logged-in member owns the fine
    private void checkOwnership(
            Fine fine, String email, boolean isAdmin) {

        if (isAdmin) {
            return;
        }

        if (!fine.getBorrowRecord().getUser()
                .getEmail().equals(email)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this fine.");
        }
    }
}

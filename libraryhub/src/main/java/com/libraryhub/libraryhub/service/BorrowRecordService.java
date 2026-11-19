
package com.libraryhub.libraryhub.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.libraryhub.libraryhub.dto.BorrowRecordRequestDTO;
import com.libraryhub.libraryhub.dto.BorrowRecordResponseDTO;
import com.libraryhub.libraryhub.entity.BookCopy;
import com.libraryhub.libraryhub.entity.BorrowRecord;
import com.libraryhub.libraryhub.entity.Reservation;
import com.libraryhub.libraryhub.entity.User;
import com.libraryhub.libraryhub.exception.ResourceNotFoundException;
import com.libraryhub.libraryhub.mapper.BorrowRecordMapper;
import com.libraryhub.libraryhub.repository.BookCopyRepository;
import com.libraryhub.libraryhub.repository.BorrowRecordRepository;
import com.libraryhub.libraryhub.repository.ReservationRepository;
import com.libraryhub.libraryhub.repository.UserRepository;
import com.libraryhub.libraryhub.service.FineService;

@Service
@Transactional(readOnly = true)
public class BorrowRecordService {
	private final FineService fineService;

    private static final int BORROWING_DAYS = 14;

    private static final int MAX_ACTIVE_BOOKS = 3;

    private static final Set<String> ACTIVE_STATUSES =
            Set.of("ISSUED", "OVERDUE");

    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationQueueService reservationQueueService;

    public BorrowRecordService(
            BorrowRecordRepository borrowRecordRepository,
            UserRepository userRepository,
            BookCopyRepository bookCopyRepository,
            ReservationRepository reservationRepository,
            ReservationQueueService reservationQueueService,
            FineService fineService) {

        this.borrowRecordRepository = borrowRecordRepository;
        this.userRepository = userRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.reservationRepository = reservationRepository;
        this.reservationQueueService = reservationQueueService;
        this.fineService = fineService;
    }

    // ADMIN: Get all borrowing records
    public List<BorrowRecordResponseDTO> getAllBorrowRecords() {

        return borrowRecordRepository.findAll()
                .stream()
                .map(BorrowRecordMapper::toDTO)
                .collect(Collectors.toList());
    }

    // MEMBER: Get only their own borrowing records
    public List<BorrowRecordResponseDTO> getMyBorrowRecords(String email) {

        return borrowRecordRepository.findByUser_Email(email)
                .stream()
                .map(BorrowRecordMapper::toDTO)
                .collect(Collectors.toList());
    }

    // ADMIN or record owner: Get borrowing record by ID
    public BorrowRecordResponseDTO getBorrowRecordById(
            Long id, String email, boolean isAdmin) {

        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Borrow record not found with ID: " + id));

        checkOwnership(record, email, isAdmin);

        return BorrowRecordMapper.toDTO(record);
    }

    // ADMIN only: Issue a book
    @Transactional
    public BorrowRecordResponseDTO issueBook(
            BorrowRecordRequestDTO request) {

        // Find the member
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + request.getUserId()));

        // Lock the physical book copy
        BookCopy copy = bookCopyRepository.findByIdForUpdate(
                request.getCopyId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book copy not found with ID: " + request.getCopyId()));

        Reservation reservation = null;

        // Check whether this issue is linked to a reservation
        if (request.getReservationId() != null) {

            // Lock and retrieve the reservation
            reservation = reservationRepository.findByIdForUpdate(
                    request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Reservation not found with ID: "
                                    + request.getReservationId()));

            // Verify member ownership
            if (!reservation.getUser().getUserId()
                    .equals(user.getUserId())) {

                throw new IllegalArgumentException(
                        "This reservation does not belong to this member.");
            }

            // Verify that the reservation belongs to this book
            if (!reservation.getBook().getBookId()
                    .equals(copy.getBook().getBookId())) {

                throw new IllegalArgumentException(
                        "This reservation is for a different book.");
            }

            // Verify reservation status
            if (!"READY_FOR_PICKUP".equals(reservation.getStatus())) {

                throw new IllegalArgumentException(
                        "Reservation is not ready for pickup.");
            }

            // Verify that the reservation has not expired
            if (reservation.getExpiryDate() == null
                    || !reservation.getExpiryDate()
                            .isAfter(LocalDateTime.now())) {

                throw new IllegalArgumentException(
                        "Reservation pickup period has expired.");
            }

            // Verify that this exact copy was assigned
            if (reservation.getAssignedCopy() == null
                    || !reservation.getAssignedCopy().getCopyId()
                            .equals(copy.getCopyId())) {

                throw new IllegalArgumentException(
                        "This physical copy is not assigned to this reservation.");
            }

            // Only the allocated copy can be issued
            if (!"RESERVED".equals(copy.getStatus())) {

                throw new IllegalArgumentException(
                        "The reserved book copy is not available for collection.");
            }

        } else {

            // Without a reservation, only an available copy can be issued
            if (!"AVAILABLE".equals(copy.getStatus())) {

                throw new IllegalArgumentException(
                        "This book copy is not available for issue.");
            }
        }

        // Check for an existing active borrowing record
        boolean alreadyIssued =
                borrowRecordRepository
                        .existsByBookCopy_CopyIdAndStatusIn(
                                request.getCopyId(), ACTIVE_STATUSES);

        if (alreadyIssued) {

            throw new IllegalArgumentException(
                    "This book copy already has an active borrowing record.");
        }

        // Check member's active borrowing count
        long activeBookCount =
                borrowRecordRepository.countByUser_UserIdAndStatusIn(
                        user.getUserId(), ACTIVE_STATUSES);

        // Enforce maximum borrowing limit
        if (activeBookCount >= MAX_ACTIVE_BOOKS) {

            throw new IllegalArgumentException(
                    "Borrowing limit exceeded. A member can borrow a maximum of "
                            + MAX_ACTIVE_BOOKS + " active books.");
        }

        // Create borrowing record
        BorrowRecord record = new BorrowRecord();

        record.setUser(user);
        record.setBookCopy(copy);

        // Fulfil reservation when applicable
        if (reservation != null) {

            record.setReservation(reservation);
            reservation.setStatus("FULFILLED");
        }

        // Set issue and due dates
        LocalDate issueDate = LocalDate.now();

        record.setIssueDate(issueDate);
        record.setDueDate(issueDate.plusDays(BORROWING_DAYS));
        record.setStatus("ISSUED");

        // Update physical copy status
        copy.setStatus("ISSUED");

        // Save borrowing record
        BorrowRecord savedRecord =
                borrowRecordRepository.save(record);

        return BorrowRecordMapper.toDTO(savedRecord);
    }

    // ADMIN only: Return a borrowed book
    @Transactional
    public BorrowRecordResponseDTO returnBook(Long borrowId) {

        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Borrow record not found with ID: " + borrowId));

        // Prevent duplicate returns
        if ("RETURNED".equals(record.getStatus())) {
            throw new IllegalArgumentException(
                    "This book has already been returned.");
        }

        // Record return date
        record.setReturnDate(LocalDate.now());
        record.setStatus("RETURNED");

        // Update physical copy status
        BookCopy copy = record.getBookCopy();
        copy.setStatus("AVAILABLE");

        // Save returned borrowing record
        BorrowRecord updatedRecord =
                borrowRecordRepository.save(record);

        // Automatically generate fine if overdue
        fineService.generateFineIfOverdue(updatedRecord);

        // Allocate copy to the next waiting member, if any
        reservationQueueService.allocateNextReservation(
                copy.getBook().getBookId());

        return BorrowRecordMapper.toDTO(updatedRecord);
    }

    // Check whether the logged-in member owns the record
    private void checkOwnership(
            BorrowRecord record, String email, boolean isAdmin) {

        if (isAdmin) {
            return;
        }

        if (!record.getUser().getEmail().equals(email)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this borrowing record.");
        }
    }
}


package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.BorrowRecordRequestDTO;
import com.libraryhub.libraryhub.dto.BorrowRecordResponseDTO;
import com.libraryhub.libraryhub.service.BorrowRecordService;

@RestController
@RequestMapping("/api/borrow-records")
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;

    public BorrowRecordController(
            BorrowRecordService borrowRecordService) {
        this.borrowRecordService = borrowRecordService;
    }

    // ADMIN: Get all records
    // MEMBER: Get only their own records
    @GetMapping
    public List<BorrowRecordResponseDTO> getBorrowRecords(
            @AuthenticationPrincipal UserDetails userDetails) {

        boolean isAdmin = isAdmin(userDetails);

        if (isAdmin) {
            return borrowRecordService.getAllBorrowRecords();
        }

        return borrowRecordService.getMyBorrowRecords(
                userDetails.getUsername());
    }

    // MEMBER: Get their own borrowing history
    @GetMapping("/my-history")
    public List<BorrowRecordResponseDTO> getMyBorrowingHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        return borrowRecordService.getMyBorrowRecords(
                userDetails.getUsername());
    }

    // ADMIN or record owner: Get record by ID
    @GetMapping("/{id}")
    public BorrowRecordResponseDTO getBorrowRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        return borrowRecordService.getBorrowRecordById(
                id,
                userDetails.getUsername(),
                isAdmin(userDetails));
    }

    // ADMIN only: Issue a book
    @PostMapping("/issue")
    @ResponseStatus(HttpStatus.CREATED)
    public BorrowRecordResponseDTO issueBook(
            @Valid @RequestBody BorrowRecordRequestDTO request) {

        return borrowRecordService.issueBook(request);
    }

    // ADMIN only: Return a book
    @PatchMapping("/{id}/return")
    public BorrowRecordResponseDTO returnBook(
            @PathVariable Long id) {

        return borrowRecordService.returnBook(id);
    }

    // Check logged-in user's role
    private boolean isAdmin(UserDetails userDetails) {

        return userDetails.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }
}

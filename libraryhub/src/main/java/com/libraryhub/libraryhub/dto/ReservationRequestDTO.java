package com.libraryhub.libraryhub.dto;

import jakarta.validation.constraints.NotNull;

public class ReservationRequestDTO {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    public ReservationRequestDTO() {
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
}
package com.libraryhub.libraryhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BookCopyRequestDTO {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotBlank(message = "Barcode cannot be empty")
    @Size(max = 50)
    private String barcode;

    public BookCopyRequestDTO() {
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }
}
package com.libraryhub.libraryhub.dto;

import java.time.LocalDateTime;

public class BookCopyResponseDTO {

    private Long copyId;
    private Long bookId;
    private String bookTitle;
    private String barcode;
    private String status;
    private LocalDateTime createdAt;

    public BookCopyResponseDTO() {
    }

    public BookCopyResponseDTO(
            Long copyId,
            Long bookId,
            String bookTitle,
            String barcode,
            String status,
            LocalDateTime createdAt) {

        this.copyId = copyId;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.barcode = barcode;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getCopyId() {
        return copyId;
    }

    public void setCopyId(Long copyId) {
        this.copyId = copyId;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
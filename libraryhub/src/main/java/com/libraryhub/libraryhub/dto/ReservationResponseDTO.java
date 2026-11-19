
package com.libraryhub.libraryhub.dto;

import java.time.LocalDateTime;

public class ReservationResponseDTO {

    private Long reservationId;
    private Long userId;
    private String userName;
    private Long bookId;
    private String bookTitle;

    private Long assignedCopyId;
    private String assignedCopyBarcode;

    private LocalDateTime reservationDate;
    private LocalDateTime expiryDate;
    private String status;

    public ReservationResponseDTO() {
    }

    public ReservationResponseDTO(
            Long reservationId,
            Long userId,
            String userName,
            Long bookId,
            String bookTitle,
            Long assignedCopyId,
            String assignedCopyBarcode,
            LocalDateTime reservationDate,
            LocalDateTime expiryDate,
            String status) {

        this.reservationId = reservationId;
        this.userId = userId;
        this.userName = userName;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.assignedCopyId = assignedCopyId;
        this.assignedCopyBarcode = assignedCopyBarcode;
        this.reservationDate = reservationDate;
        this.expiryDate = expiryDate;
        this.status = status;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public Long getAssignedCopyId() {
        return assignedCopyId;
    }

    public void setAssignedCopyId(Long assignedCopyId) {
        this.assignedCopyId = assignedCopyId;
    }

    public String getAssignedCopyBarcode() {
        return assignedCopyBarcode;
    }

    public void setAssignedCopyBarcode(String assignedCopyBarcode) {
        this.assignedCopyBarcode = assignedCopyBarcode;
    }

    public LocalDateTime getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDateTime reservationDate) {
        this.reservationDate = reservationDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

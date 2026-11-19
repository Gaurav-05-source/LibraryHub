
package com.libraryhub.libraryhub.dto;

import java.math.BigDecimal;

public class MemberDashboardDTO {

    private long borrowedBooks;
    private long pendingReservations;
    private long dueSoon;
    private BigDecimal pendingFines;

    public MemberDashboardDTO() {
    }

    public MemberDashboardDTO(
            long borrowedBooks,
            long pendingReservations,
            long dueSoon,
            BigDecimal pendingFines) {
        this.borrowedBooks = borrowedBooks;
        this.pendingReservations = pendingReservations;
        this.dueSoon = dueSoon;
        this.pendingFines = pendingFines;
    }

    public long getBorrowedBooks() {
        return borrowedBooks;
    }

    public void setBorrowedBooks(long borrowedBooks) {
        this.borrowedBooks = borrowedBooks;
    }

    public long getPendingReservations() {
        return pendingReservations;
    }

    public void setPendingReservations(long pendingReservations) {
        this.pendingReservations = pendingReservations;
    }

    public long getDueSoon() {
        return dueSoon;
    }

    public void setDueSoon(long dueSoon) {
        this.dueSoon = dueSoon;
    }

    public BigDecimal getPendingFines() {
        return pendingFines;
    }

    public void setPendingFines(BigDecimal pendingFines) {
        this.pendingFines = pendingFines;
    }
}

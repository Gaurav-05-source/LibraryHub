package com.libraryhub.libraryhub.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

public class FineRequestDTO {

    @NotNull(message = "Borrow record ID is required")
    private Long borrowId;

    @NotNull(message = "Fine amount is required")
    @DecimalMin(value = "0.01", message = "Fine amount must be greater than zero")
    private BigDecimal amount;

    public FineRequestDTO() {
    }

    public Long getBorrowId() {
        return borrowId;
    }

    public void setBorrowId(Long borrowId) {
        this.borrowId = borrowId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
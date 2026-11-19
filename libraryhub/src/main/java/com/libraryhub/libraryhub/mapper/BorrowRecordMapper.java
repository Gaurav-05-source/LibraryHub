package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.BorrowRecordResponseDTO;
import com.libraryhub.libraryhub.entity.BorrowRecord;

public class BorrowRecordMapper {

    public static BorrowRecordResponseDTO toDTO(BorrowRecord record) {

        BorrowRecordResponseDTO dto = new BorrowRecordResponseDTO();

        dto.setBorrowId(record.getBorrowId());
        dto.setIssueDate(record.getIssueDate());
        dto.setDueDate(record.getDueDate());
        dto.setReturnDate(record.getReturnDate());
        dto.setStatus(record.getStatus());

        if (record.getUser() != null) {
            dto.setUserId(record.getUser().getUserId());
            dto.setUserName(record.getUser().getName());
        }

        if (record.getBookCopy() != null) {
            dto.setCopyId(record.getBookCopy().getCopyId());
            dto.setBarcode(record.getBookCopy().getBarcode());

            if (record.getBookCopy().getBook() != null) {
                dto.setBookTitle(record.getBookCopy().getBook().getTitle());
            }
        }

        if (record.getReservation() != null) {
            dto.setReservationId(
                    record.getReservation().getReservationId()
            );
        }

        return dto;
    }
}
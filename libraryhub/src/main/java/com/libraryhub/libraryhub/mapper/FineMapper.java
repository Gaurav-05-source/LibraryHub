
package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.FineResponseDTO;
import com.libraryhub.libraryhub.entity.Fine;

public class FineMapper {

    public static FineResponseDTO toDTO(Fine fine) {

        FineResponseDTO dto = new FineResponseDTO();

        dto.setFineId(fine.getFineId());
        dto.setAmount(fine.getAmount());
        dto.setPaymentStatus(fine.getPaymentStatus());
        dto.setCreatedAt(fine.getCreatedAt());
        dto.setPaidAt(fine.getPaidAt());

        if (fine.getBorrowRecord() != null) {

            dto.setBorrowId(
                    fine.getBorrowRecord().getBorrowId()
            );

            if (fine.getBorrowRecord().getUser() != null) {
                dto.setUserId(
                        fine.getBorrowRecord().getUser().getUserId()
                );

                dto.setUserName(
                        fine.getBorrowRecord().getUser().getName()
                );
            }

            if (fine.getBorrowRecord().getBookCopy() != null) {

                dto.setCopyId(
                        fine.getBorrowRecord()
                                .getBookCopy().getCopyId()
                );

                if (fine.getBorrowRecord()
                        .getBookCopy().getBook() != null) {

                    dto.setBookTitle(
                            fine.getBorrowRecord()
                                    .getBookCopy()
                                    .getBook()
                                    .getTitle()
                    );
                }
            }
        }

        return dto;
    }
}

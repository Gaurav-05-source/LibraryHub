package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.BookCopyResponseDTO;
import com.libraryhub.libraryhub.entity.BookCopy;

public class BookCopyMapper {

    public static BookCopyResponseDTO toDTO(BookCopy copy) {

        BookCopyResponseDTO dto = new BookCopyResponseDTO();

        dto.setCopyId(copy.getCopyId());
        dto.setBarcode(copy.getBarcode());
        dto.setStatus(copy.getStatus());
        dto.setCreatedAt(copy.getCreatedAt());

        if (copy.getBook() != null) {
            dto.setBookId(copy.getBook().getBookId());
            dto.setBookTitle(copy.getBook().getTitle());
        }

        return dto;
    }
}
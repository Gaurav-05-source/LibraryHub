package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.BookResponseDTO;
import com.libraryhub.libraryhub.entity.Book;

public class BookMapper {

    public static BookResponseDTO toDTO(Book book) {

        BookResponseDTO dto = new BookResponseDTO();

        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setIsbn(book.getIsbn());
        dto.setAuthor(book.getAuthor());
        dto.setPublisher(book.getPublisher());
        dto.setPublicationYear(book.getPublicationYear());
        dto.setDescription(book.getDescription());
        dto.setCreatedAt(book.getCreatedAt());

        if (book.getCategory() != null) {
            dto.setCategoryId(book.getCategory().getCategoryId());
            dto.setCategoryName(book.getCategory().getCategoryName());
        }

        return dto;
    }
}
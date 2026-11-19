
package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.BookCopyRequestDTO;
import com.libraryhub.libraryhub.dto.BookCopyResponseDTO;
import com.libraryhub.libraryhub.service.BookCopyService;

@RestController
@RequestMapping("/api/book-copies")
public class BookCopyController {

    private final BookCopyService bookCopyService;

    // Constructor injection
    public BookCopyController(BookCopyService bookCopyService) {
        this.bookCopyService = bookCopyService;
    }

    // Get all physical book copies
    @GetMapping
    public List<BookCopyResponseDTO> getAllBookCopies() {
        return bookCopyService.getAllBookCopies();
    }

    // Get a physical copy by ID
    @GetMapping("/{id}")
    public BookCopyResponseDTO getBookCopyById(
            @PathVariable Long id) {

        return bookCopyService.getBookCopyById(id);
    }

    // Add a new physical copy
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookCopyResponseDTO createBookCopy(
            @Valid @RequestBody BookCopyRequestDTO request) {

        return bookCopyService.saveBookCopy(request);
    }

    // Delete a physical copy
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBookCopy(@PathVariable Long id) {

        bookCopyService.deleteBookCopy(id);
    }
}


package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.BookRequestDTO;
import com.libraryhub.libraryhub.dto.BookResponseDTO;
import com.libraryhub.libraryhub.service.BookService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Search, filter, sort and paginate books
    @GetMapping("/search")
    public Page<BookResponseDTO> searchBooks(

            @RequestParam(required = false) String keyword,

            @RequestParam(required = false) Long categoryId,

            @RequestParam(required = false) Integer publicationYear,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "title") String sortBy,

            @RequestParam(defaultValue = "ASC") String direction) {

        return bookService.searchBooks(
                keyword,
                categoryId,
                publicationYear,
                page,
                size,
                sortBy,
                direction
        );
    }

    // Get all books
    @GetMapping
    public List<BookResponseDTO> getAllBooks() {
        return bookService.getAllBooks();
    }

    // Get book by ID
    @GetMapping("/{id}")
    public BookResponseDTO getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    // Add a new book
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponseDTO createBook(
            @Valid @RequestBody BookRequestDTO request) {
        return bookService.saveBook(request);
    }

    // Update book details
    @PutMapping("/{id}")
    public BookResponseDTO updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequestDTO request) {
        return bookService.updateBook(id, request);
    }

    // Delete a book
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
    }
}

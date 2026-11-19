
package com.libraryhub.libraryhub.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.dto.BookRequestDTO;
import com.libraryhub.libraryhub.dto.BookResponseDTO;
import com.libraryhub.libraryhub.entity.Book;
import com.libraryhub.libraryhub.entity.Category;
import com.libraryhub.libraryhub.exception.ResourceNotFoundException;
import com.libraryhub.libraryhub.mapper.BookMapper;
import com.libraryhub.libraryhub.repository.BookRepository;
import com.libraryhub.libraryhub.repository.BookCopyRepository;
import com.libraryhub.libraryhub.repository.CategoryRepository;

@Service
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookService(
            BookRepository bookRepository,
            CategoryRepository categoryRepository,
            BookCopyRepository bookCopyRepository) {

        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    // Convert Book entity into DTO with copy counts
    private BookResponseDTO mapWithCopyCounts(Book book) {

        BookResponseDTO dto = BookMapper.toDTO(book);

        long totalCopies =
                bookCopyRepository.countByBook_BookId(book.getBookId());

        long availableCopies =
                bookCopyRepository.countByBook_BookIdAndStatus(
                        book.getBookId(), "AVAILABLE");
        
        long reservedCopies =
                bookCopyRepository.countByBook_BookIdAndStatus(
                        book.getBookId(), "RESERVED");

        long issuedCopies =
                bookCopyRepository.countByBook_BookIdAndStatus(
                        book.getBookId(), "ISSUED");

        dto.setTotalCopies(totalCopies);
        dto.setAvailableCopies(availableCopies);
        dto.setReservedCopies(reservedCopies);
        dto.setIssuedCopies(issuedCopies);

        return dto;
    }

    // Get all books
    public List<BookResponseDTO> getAllBooks() {

        return bookRepository.findAll()
                .stream()
                .map(this::mapWithCopyCounts)
                .collect(Collectors.toList());
    }

    // Get book by ID
    public BookResponseDTO getBookById(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with ID: " + id));

        return mapWithCopyCounts(book);
    }

    // Search, filter, sort and paginate books
    public Page<BookResponseDTO> searchBooks(
            String keyword,
            Long categoryId,
            Integer publicationYear,
            int page,
            int size,
            String sortBy,
            String direction) {

        // Validate pagination
        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page number cannot be negative.");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100.");
        }

        // Validate sorting field
        List<String> allowedSortFields =
                List.of("title", "author", "publicationYear");

        if (!allowedSortFields.contains(sortBy)) {
            throw new IllegalArgumentException(
                    "Invalid sort field. Allowed fields: title, author, publicationYear.");
        }

        // Determine sorting direction
        Sort.Direction sortDirection;

        try {
            sortDirection = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Sort direction must be ASC or DESC.");
        }

        // Create pagination and sorting object
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(sortDirection, sortBy)
        );

        // Normalize keyword
        if (keyword != null && keyword.isBlank()) {
            keyword = null;
        }

        // Execute repository search
        Page<Book> books = bookRepository.searchBooks(
                keyword,
                categoryId,
                publicationYear,
                pageable
        );

        // Convert entity page into DTO page with copy counts
        return books.map(this::mapWithCopyCounts);
    }

    // Create a new book
    @Transactional
    public BookResponseDTO saveBook(BookRequestDTO request) {

        Category category = categoryRepository.findById(
                request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: "
                        + request.getCategoryId()));

        Book book = new Book();

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setCategory(category);

        Book savedBook = bookRepository.save(book);

        return mapWithCopyCounts(savedBook);
    }

    // Update an existing book
    @Transactional
    public BookResponseDTO updateBook(
            Long id, BookRequestDTO request) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with ID: " + id));

        Category category = categoryRepository.findById(
                request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: "
                        + request.getCategoryId()));

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setAuthor(request.getAuthor());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setDescription(request.getDescription());
        book.setCategory(category);

        Book updatedBook = bookRepository.save(book);

        return mapWithCopyCounts(updatedBook);
    }

    // Delete a book
    @Transactional
    public void deleteBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with ID: " + id));

        bookRepository.delete(book);
    }
}

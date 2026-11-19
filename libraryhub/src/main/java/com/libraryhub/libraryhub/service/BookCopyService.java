
package com.libraryhub.libraryhub.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.dto.BookCopyRequestDTO;
import com.libraryhub.libraryhub.dto.BookCopyResponseDTO;
import com.libraryhub.libraryhub.entity.Book;
import com.libraryhub.libraryhub.entity.BookCopy;
import com.libraryhub.libraryhub.exception.ResourceNotFoundException;
import com.libraryhub.libraryhub.mapper.BookCopyMapper;
import com.libraryhub.libraryhub.repository.BookCopyRepository;
import com.libraryhub.libraryhub.repository.BookRepository;
import com.libraryhub.libraryhub.repository.BorrowRecordRepository;

@Service
@Transactional(readOnly = true)
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public BookCopyService(
            BookCopyRepository bookCopyRepository,
            BookRepository bookRepository,
            BorrowRecordRepository borrowRecordRepository) {

        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    // Get all book copies
    public List<BookCopyResponseDTO> getAllBookCopies() {

        return bookCopyRepository.findAll()
                .stream()
                .map(BookCopyMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get book copy by ID
    public BookCopyResponseDTO getBookCopyById(Long id) {

        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book copy not found with ID: " + id));

        return BookCopyMapper.toDTO(bookCopy);
    }

    // Add a new physical book copy
    @Transactional
    public BookCopyResponseDTO saveBookCopy(
            BookCopyRequestDTO request) {

        String barcode = request.getBarcode().trim();

        // Prevent duplicate barcode
        if (bookCopyRepository.existsByBarcode(barcode)) {
            throw new IllegalArgumentException(
                    "A book copy with this barcode already exists.");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book not found with ID: " + request.getBookId()));

        BookCopy bookCopy = new BookCopy();

        bookCopy.setBook(book);
        bookCopy.setBarcode(barcode);

        // Every new physical copy starts as AVAILABLE
        bookCopy.setStatus("AVAILABLE");

        BookCopy savedBookCopy =
                bookCopyRepository.save(bookCopy);

        return BookCopyMapper.toDTO(savedBookCopy);
    }

    // Delete a physical book copy
    @Transactional
    public void deleteBookCopy(Long id) {

        BookCopy bookCopy = bookCopyRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Book copy not found with ID: " + id));

        // Only AVAILABLE copies can be deleted
        if (!"AVAILABLE".equals(bookCopy.getStatus())) {
            throw new IllegalArgumentException(
                    "Cannot delete a book copy that is issued or reserved.");
        }

        // Preserve borrowing history
        if (borrowRecordRepository.existsByBookCopy_CopyId(id)) {
            throw new IllegalArgumentException(
                    "Cannot delete this copy because it has borrowing history.");
        }

        bookCopyRepository.delete(bookCopy);
    }
}

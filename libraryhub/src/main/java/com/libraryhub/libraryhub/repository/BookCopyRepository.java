
package com.libraryhub.libraryhub.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.libraryhub.libraryhub.entity.BookCopy;

import jakarta.persistence.LockModeType;

@Repository
public interface BookCopyRepository
        extends JpaRepository<BookCopy, Long> {
	

    // Check whether barcode already exists
    boolean existsByBarcode(String barcode);

    // Count all physical copies of a book
    long countByBook_BookId(Long bookId);

    // Count copies by status
    long countByBook_BookIdAndStatus(
            Long bookId, String status);

    // Find and lock a particular physical copy
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT bc FROM BookCopy bc WHERE bc.copyId = :copyId")
    Optional<BookCopy> findByIdForUpdate(
            @Param("copyId") Long copyId);

    // Find and lock the first available copy
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<BookCopy>
    findFirstByBook_BookIdAndStatusOrderByCopyIdAsc(
            Long bookId, String status);
}

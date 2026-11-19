
package com.libraryhub.libraryhub.repository;

import java.util.Collection;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.libraryhub.libraryhub.entity.BorrowRecord;

public interface BorrowRecordRepository
        extends JpaRepository<BorrowRecord, Long> {
	

    List<BorrowRecord> findByUser_Email(String email);
    
    
    long countByUser_EmailAndStatusIn(
            String email,
            Collection<String> statuses
    );

    long countByUser_EmailAndStatusAndDueDateBetween(
            String email,
            String status,
            LocalDate startDate,
            LocalDate endDate
    );

    // Check active borrowing for a physical copy
    boolean existsByBookCopy_CopyIdAndStatusIn(
            Long copyId, Collection<String> statuses);

    // Count member's active borrowing records
    long countByUser_UserIdAndStatusIn(
            Long userId,
            Collection<String> statuses);

    // Check whether a physical copy has any borrowing history
    boolean existsByBookCopy_CopyId(Long copyId);
}

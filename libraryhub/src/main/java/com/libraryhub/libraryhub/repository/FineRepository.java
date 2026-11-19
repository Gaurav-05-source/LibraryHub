
package com.libraryhub.libraryhub.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.libraryhub.libraryhub.entity.Fine;

public interface FineRepository extends JpaRepository<Fine, Long> {
	
	List<Fine> findByBorrowRecord_User_Email(String email);
	@Query("""
		    SELECT COALESCE(SUM(f.amount), 0)
		    FROM Fine f
		    WHERE f.borrowRecord.user.email = :email
		    AND f.paymentStatus = :paymentStatus
		""")
		BigDecimal calculatePendingFines(
		        @Param("email") String email,
		        @Param("paymentStatus") String paymentStatus
		);

    boolean existsByBorrowRecord_BorrowId(Long borrowId);
}

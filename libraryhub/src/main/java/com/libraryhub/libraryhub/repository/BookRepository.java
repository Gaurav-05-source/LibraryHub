
package com.libraryhub.libraryhub.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.libraryhub.libraryhub.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("""
        SELECT b FROM Book b
        WHERE
            (:keyword IS NULL OR
                LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR
                LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            AND
            (:categoryId IS NULL OR
                b.category.categoryId = :categoryId
            )
            AND
            (:publicationYear IS NULL OR
                b.publicationYear = :publicationYear
            )
        """)
    Page<Book> searchBooks(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("publicationYear") Integer publicationYear,
            Pageable pageable
    );
}

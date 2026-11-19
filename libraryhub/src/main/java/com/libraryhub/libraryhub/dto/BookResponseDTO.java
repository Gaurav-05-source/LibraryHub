
package com.libraryhub.libraryhub.dto;

import java.time.LocalDateTime;



public class BookResponseDTO {
	
	private Long reservedCopies;
	private Long issuedCopies;
    private Long bookId;
    private String title;
    private String isbn;
    private String author;
    private String publisher;
    private Integer publicationYear;
    private String description;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;

    private Long totalCopies;
    private Long availableCopies;

    public BookResponseDTO() {
    }

    public BookResponseDTO(
            Long bookId,
            String title,
            String isbn,
            String author,
            String publisher,
            Integer publicationYear,
            String description,
            Long categoryId,
            String categoryName,
            LocalDateTime createdAt,
            Long totalCopies,
            Long availableCopies) {

        this.bookId = bookId;
        this.title = title;
        this.isbn = isbn;
        this.author = author;
        this.publisher = publisher;
        this.publicationYear = publicationYear;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.createdAt = createdAt;
        this.totalCopies = totalCopies;
        this.availableCopies = availableCopies;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getTotalCopies() {
        return totalCopies;
    }

    public void setTotalCopies(Long totalCopies) {
        this.totalCopies = totalCopies;
    }

    public Long getAvailableCopies() {
        return availableCopies;
    }

    public void setAvailableCopies(Long availableCopies) {
        this.availableCopies = availableCopies;
    }
    
    public Long getReservedCopies() {
        return reservedCopies;
    }

    public void setReservedCopies(Long reservedCopies) {
        this.reservedCopies = reservedCopies;
    }

    public Long getIssuedCopies() {
        return issuedCopies;
    }

    public void setIssuedCopies(Long issuedCopies) {
        this.issuedCopies = issuedCopies;
    }
}

package com.libraryhub.libraryhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

public class BookRequestDTO {

    @NotBlank(message = "Book title cannot be empty")
    @Size(max = 200)
    private String title;

    @NotBlank(message = "ISBN cannot be empty")
    @Size(max = 20)
    private String isbn;

    @NotBlank(message = "Author cannot be empty")
    @Size(max = 150)
    private String author;

    @Size(max = 150)
    private String publisher;

    @Min(value = 1, message = "Invalid publication year")
    @Max(value = 9999, message = "Invalid publication year")
    private Integer publicationYear;

    private String description;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    public BookRequestDTO() {
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
}
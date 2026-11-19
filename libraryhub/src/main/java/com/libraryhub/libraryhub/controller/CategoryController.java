
package com.libraryhub.libraryhub.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.libraryhub.libraryhub.dto.CategoryRequestDTO;
import com.libraryhub.libraryhub.dto.CategoryResponseDTO;
import com.libraryhub.libraryhub.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    // Constructor injection
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Get all categories
    @GetMapping
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // Get category by ID
    @GetMapping("/{id}")
    public CategoryResponseDTO getCategoryById(
            @PathVariable Long id) {

        return categoryService.getCategoryById(id);
    }

    // Create a new category
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponseDTO createCategory(
            @Valid @RequestBody CategoryRequestDTO request) {

        return categoryService.saveCategory(request);
    }

    // Update an existing category
    @PutMapping("/{id}")
    public CategoryResponseDTO updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO request) {

        return categoryService.updateCategory(id, request);
    }

    // Delete a category
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {

        categoryService.deleteCategory(id);
    }
}

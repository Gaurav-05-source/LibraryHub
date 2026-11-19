package com.libraryhub.libraryhub.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.libraryhub.libraryhub.dto.CategoryRequestDTO;
import com.libraryhub.libraryhub.dto.CategoryResponseDTO;
import com.libraryhub.libraryhub.entity.Category;
import com.libraryhub.libraryhub.exception.ResourceNotFoundException;
import com.libraryhub.libraryhub.mapper.CategoryMapper;
import com.libraryhub.libraryhub.repository.CategoryRepository;

@Service
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Get all categories
    public List<CategoryResponseDTO> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    // Get category by ID
    public CategoryResponseDTO getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: " + id));

        return CategoryMapper.toDTO(category);
    }

    // Create category
    @Transactional
    public CategoryResponseDTO saveCategory(CategoryRequestDTO request) {

        Category category = new Category();

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());

        Category savedCategory = categoryRepository.save(category);

        return CategoryMapper.toDTO(savedCategory);
    }

    // Update category
    @Transactional
    public CategoryResponseDTO updateCategory(
            Long id, CategoryRequestDTO request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: " + id));

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());

        Category updatedCategory = categoryRepository.save(category);

        return CategoryMapper.toDTO(updatedCategory);
    }

    // Delete category
    @Transactional
    public void deleteCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with ID: " + id));

        categoryRepository.delete(category);
    }
}
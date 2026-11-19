package com.libraryhub.libraryhub.mapper;

import com.libraryhub.libraryhub.dto.CategoryResponseDTO;
import com.libraryhub.libraryhub.entity.Category;

public class CategoryMapper {

    public static CategoryResponseDTO toDTO(Category category) {

        return new CategoryResponseDTO(
                category.getCategoryId(),
                category.getCategoryName(),
                category.getDescription()
        );
    }
}
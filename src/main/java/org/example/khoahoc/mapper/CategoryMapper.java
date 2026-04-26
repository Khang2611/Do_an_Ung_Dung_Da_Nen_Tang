package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.CategoryCreationRequest;
import org.example.khoahoc.dto.request.CategoryUpdateRequest;
import org.example.khoahoc.dto.response.CategoryResponse;
import org.example.khoahoc.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Category toCategory(CategoryCreationRequest request);

    CategoryResponse toCategoryResponse(Category category);
    List<CategoryResponse> toCategoryResponseList(List<Category> categories);

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateCategory(@MappingTarget Category category, CategoryUpdateRequest request);
}

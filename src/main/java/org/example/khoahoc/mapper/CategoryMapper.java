package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.response.CategoryResponse;
import org.example.khoahoc.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toCategoryResponse(Category category);
}

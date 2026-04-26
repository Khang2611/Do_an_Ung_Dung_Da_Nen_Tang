package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.CourseCreationRequest;
import org.example.khoahoc.dto.request.CourseUpdateRequest;
import org.example.khoahoc.dto.response.CourseResponse;
import org.example.khoahoc.entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class})
public interface CourseMapper {

    // CourseCreationRequest → Course
    // category là object @ManyToOne, service sẽ lookup bằng categoryId rồi set thủ công
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Course toCourse(CourseCreationRequest request);

    // Course → CourseResponse
    // MapStruct dùng CategoryMapper để tự map course.category → CategoryResponse
    CourseResponse toCourseResponse(Course course);

    // Cập nhật Course từ CourseUpdateRequest
    // courseId, category, createdDate không được thay đổi qua mapper
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateCourse(@MappingTarget Course course, CourseUpdateRequest request);
}

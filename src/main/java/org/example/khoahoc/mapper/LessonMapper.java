package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.LessonCreationRequest;
import org.example.khoahoc.dto.request.LessonUpdateRequest;
import org.example.khoahoc.dto.response.LessonResponse;
import org.example.khoahoc.entity.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Lesson toLesson(LessonCreationRequest request);

    LessonResponse toLessonResponse(Lesson lesson);
    List<LessonResponse> toLessonResponseList(List<Lesson> lessons);

    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "chapterId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateLesson(@MappingTarget Lesson lesson, LessonUpdateRequest request);
}

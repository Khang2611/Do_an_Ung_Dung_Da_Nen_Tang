package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.LearningProgressCreationRequest;
import org.example.khoahoc.dto.request.LearningProgressUpdateRequest;
import org.example.khoahoc.dto.response.LearningProgressResponse;
import org.example.khoahoc.entity.LearningProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LearningProgressMapper {

    @Mapping(target = "progressId", ignore = true)
    @Mapping(target = "completedDate", ignore = true)
    LearningProgress toLearningProgress(LearningProgressCreationRequest request);

    LearningProgressResponse toLearningProgressResponse(LearningProgress learningProgress);
    List<LearningProgressResponse> toLearningProgressResponseList(List<LearningProgress> learningProgresses);

    @Mapping(target = "progressId", ignore = true)
    @Mapping(target = "enrollmentId", ignore = true)
    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "completedDate", ignore = true)
    void updateLearningProgress(@MappingTarget LearningProgress learningProgress, LearningProgressUpdateRequest request);
}

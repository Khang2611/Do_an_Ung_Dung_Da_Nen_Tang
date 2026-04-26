package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.ChapterCreationRequest;
import org.example.khoahoc.dto.request.ChapterUpdateRequest;
import org.example.khoahoc.dto.response.ChapterResponse;
import org.example.khoahoc.entity.Chapter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChapterMapper {

    @Mapping(target = "chapterId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Chapter toChapter(ChapterCreationRequest request);

    ChapterResponse toChapterResponse(Chapter chapter);
    List<ChapterResponse> toChapterResponseList(List<Chapter> chapters);

    @Mapping(target = "chapterId", ignore = true)
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateChapter(@MappingTarget Chapter chapter, ChapterUpdateRequest request);
}

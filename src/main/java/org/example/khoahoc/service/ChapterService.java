package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.ChapterCreationRequest;
import org.example.khoahoc.dto.request.ChapterUpdateRequest;
import org.example.khoahoc.dto.response.ChapterResponse;
import org.example.khoahoc.entity.Chapter;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.ChapterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChapterService {

    ChapterRepository chapterRepository;

    public ChapterResponse createChapter(ChapterCreationRequest request) {
        log.info("Creating new chapter with title: {}", request.getTitle());

        Chapter chapter = Chapter.builder()
                .courseId(request.getCourseId())
                .title(request.getTitle())
                .orderIndex(request.getOrderIndex())
                .build();

        chapter = chapterRepository.save(chapter);
        return mapToResponse(chapter);
    }

    public ChapterResponse getChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));
        return mapToResponse(chapter);
    }

    public List<ChapterResponse> getAllChapters() {
        return chapterRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ChapterResponse> getChaptersByCourseId(Long courseId) {
        return chapterRepository.findByCourseId(courseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ChapterResponse updateChapter(Long id, ChapterUpdateRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        if (request.getTitle() != null) chapter.setTitle(request.getTitle());
        if (request.getOrderIndex() != null) chapter.setOrderIndex(request.getOrderIndex());

        chapter = chapterRepository.save(chapter);
        return mapToResponse(chapter);
    }

    public void deleteChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));
        chapterRepository.delete(chapter);
    }

    private ChapterResponse mapToResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .chapterId(chapter.getChapterId())
                .courseId(chapter.getCourseId())
                .title(chapter.getTitle())
                .orderIndex(chapter.getOrderIndex())
                .createdDate(chapter.getCreatedDate())
                .build();
    }
}

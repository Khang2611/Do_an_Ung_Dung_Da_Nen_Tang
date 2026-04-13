package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.LessonCreationRequest;
import org.example.khoahoc.dto.request.LessonUpdateRequest;
import org.example.khoahoc.dto.response.LessonResponse;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LessonService {

    LessonRepository lessonRepository;

    public LessonResponse createLesson(LessonCreationRequest request) {
        log.info("Creating new lesson with title: {}", request.getTitle());

        Lesson lesson = Lesson.builder()
                .chapterId(request.getChapterId())
                .title(request.getTitle())
                .content(request.getContent())
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration())
                .orderIndex(request.getOrderIndex())
                .build();

        lesson = lessonRepository.save(lesson);
        return mapToResponse(lesson);
    }

    public LessonResponse getLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
        return mapToResponse(lesson);
    }

    public List<LessonResponse> getAllLessons() {
        return lessonRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getLessonsByChapterId(Long chapterId) {
        return lessonRepository.findByChapterId(chapterId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LessonResponse updateLesson(Long id, LessonUpdateRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getContent() != null) lesson.setContent(request.getContent());
        if (request.getVideoUrl() != null) lesson.setVideoUrl(request.getVideoUrl());
        if (request.getDuration() != null) lesson.setDuration(request.getDuration());
        if (request.getOrderIndex() != null) lesson.setOrderIndex(request.getOrderIndex());

        lesson = lessonRepository.save(lesson);
        return mapToResponse(lesson);
    }

    public void deleteLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
        lessonRepository.delete(lesson);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .lessonId(lesson.getLessonId())
                .chapterId(lesson.getChapterId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .videoUrl(lesson.getVideoUrl())
                .duration(lesson.getDuration())
                .orderIndex(lesson.getOrderIndex())
                .createdDate(lesson.getCreatedDate())
                .build();
    }
}

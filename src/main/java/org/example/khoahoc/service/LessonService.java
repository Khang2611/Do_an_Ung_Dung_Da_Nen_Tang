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
import org.example.khoahoc.mapper.LessonMapper;
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
    LessonMapper lessonMapper;

    public LessonResponse createLesson(LessonCreationRequest request) {
        log.info("Creating new lesson with title: {}", request.getTitle());

        Lesson lesson = lessonMapper.toLesson(request);

        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponse(lesson);
    }

    public LessonResponse getLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
        return lessonMapper.toLessonResponse(lesson);
    }

    public List<LessonResponse> getAllLessons() {
        return lessonMapper.toLessonResponseList(lessonRepository.findAll());
    }

    public List<LessonResponse> getLessonsByChapterId(Long chapterId) {
        return lessonMapper.toLessonResponseList(lessonRepository.findByChapterId(chapterId));
    }

    public LessonResponse updateLesson(Long id, LessonUpdateRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        lessonMapper.updateLesson(lesson, request);

        lesson = lessonRepository.save(lesson);
        return lessonMapper.toLessonResponse(lesson);
    }

    public void deleteLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));
        lessonRepository.delete(lesson);
    }
}

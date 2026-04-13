package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.LearningProgressCreationRequest;
import org.example.khoahoc.dto.request.LearningProgressUpdateRequest;
import org.example.khoahoc.dto.response.LearningProgressResponse;
import org.example.khoahoc.entity.LearningProgress;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.LearningProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LearningProgressService {

    LearningProgressRepository learningProgressRepository;

    public LearningProgressResponse createLearningProgress(LearningProgressCreationRequest request) {
        log.info("Creating learning progress for enrollmentId: {}, lessonId: {}", request.getEnrollmentId(), request.getLessonId());

        if (learningProgressRepository.findByEnrollmentIdAndLessonId(request.getEnrollmentId(), request.getLessonId()).isPresent()) {
            throw new RuntimeException("Learning progress for this lesson already exists");
        }

        LearningProgress progress = LearningProgress.builder()
                .enrollmentId(request.getEnrollmentId())
                .lessonId(request.getLessonId())
                .isCompleted(request.getIsCompleted() != null && request.getIsCompleted())
                .build();

        progress = learningProgressRepository.save(progress);
        return mapToResponse(progress);
    }

    public LearningProgressResponse getLearningProgress(Long id) {
        LearningProgress progress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LEARNING_PROGRESS_NOT_FOUND));
        return mapToResponse(progress);
    }

    public List<LearningProgressResponse> getAllLearningProgresses() {
        return learningProgressRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LearningProgressResponse> getLearningProgressesByEnrollmentId(Long enrollmentId) {
        return learningProgressRepository.findByEnrollmentId(enrollmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public LearningProgressResponse updateLearningProgress(Long id, LearningProgressUpdateRequest request) {
        LearningProgress progress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LEARNING_PROGRESS_NOT_FOUND));

        if (request.getIsCompleted() != null) {
            progress.setIsCompleted(request.getIsCompleted());
            if (Boolean.TRUE.equals(request.getIsCompleted()) && progress.getCompletedDate() == null) {
                progress.setCompletedDate(LocalDateTime.now());
            } else if (Boolean.FALSE.equals(request.getIsCompleted())) {
                 progress.setCompletedDate(null);
            }
        }

        progress = learningProgressRepository.save(progress);
        return mapToResponse(progress);
    }

    public void deleteLearningProgress(Long id) {
        LearningProgress progress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LEARNING_PROGRESS_NOT_FOUND));
        learningProgressRepository.delete(progress);
    }

    private LearningProgressResponse mapToResponse(LearningProgress progress) {
        return LearningProgressResponse.builder()
                .progressId(progress.getProgressId())
                .enrollmentId(progress.getEnrollmentId())
                .lessonId(progress.getLessonId())
                .isCompleted(progress.getIsCompleted())
                .completedDate(progress.getCompletedDate())
                .build();
    }
}

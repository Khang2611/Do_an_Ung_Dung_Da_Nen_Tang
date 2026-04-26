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
import org.example.khoahoc.mapper.LearningProgressMapper;
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
    LearningProgressMapper learningProgressMapper;

    public LearningProgressResponse createLearningProgress(LearningProgressCreationRequest request) {
        log.info("Creating learning progress for enrollmentId: {}, lessonId: {}", request.getEnrollmentId(), request.getLessonId());

        if (learningProgressRepository.findByEnrollmentIdAndLessonId(request.getEnrollmentId(), request.getLessonId()).isPresent()) {
            throw new AppException(ErrorCode.LEARNING_PROGRESS_EXISTED);
        }

        LearningProgress progress = learningProgressMapper.toLearningProgress(request);
        if (progress.getIsCompleted() == null) {
            progress.setIsCompleted(false);
        }

        progress = learningProgressRepository.save(progress);
        return learningProgressMapper.toLearningProgressResponse(progress);
    }

    public LearningProgressResponse getLearningProgress(Long id) {
        LearningProgress progress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LEARNING_PROGRESS_NOT_FOUND));
        return learningProgressMapper.toLearningProgressResponse(progress);
    }

    public List<LearningProgressResponse> getAllLearningProgresses() {
        return learningProgressMapper.toLearningProgressResponseList(learningProgressRepository.findAll());
    }

    public List<LearningProgressResponse> getLearningProgressesByEnrollmentId(Long enrollmentId) {
        return learningProgressMapper.toLearningProgressResponseList(learningProgressRepository.findByEnrollmentId(enrollmentId));
    }

    public LearningProgressResponse updateLearningProgress(Long id, LearningProgressUpdateRequest request) {
        LearningProgress progress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LEARNING_PROGRESS_NOT_FOUND));

        if (request.getIsCompleted() != null) {
            learningProgressMapper.updateLearningProgress(progress, request);
            
            if (Boolean.TRUE.equals(progress.getIsCompleted()) && progress.getCompletedDate() == null) {
                progress.setCompletedDate(LocalDateTime.now());
            } else if (Boolean.FALSE.equals(progress.getIsCompleted())) {
                 progress.setCompletedDate(null);
            }
        }

        progress = learningProgressRepository.save(progress);
        return learningProgressMapper.toLearningProgressResponse(progress);
    }

    public void deleteLearningProgress(Long id) {
        LearningProgress progress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LEARNING_PROGRESS_NOT_FOUND));
        learningProgressRepository.delete(progress);
    }
}

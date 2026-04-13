package org.example.khoahoc.repository;

import org.example.khoahoc.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long>, JpaSpecificationExecutor<LearningProgress> {
    List<LearningProgress> findByEnrollmentId(Long enrollmentId);
    Optional<LearningProgress> findByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);
}

package org.example.khoahoc.repository;

import org.example.khoahoc.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long>, JpaSpecificationExecutor<Lesson> {
    List<Lesson> findByChapterId(Long chapterId);

    // Lấy lessons của chapter theo thứ tự orderIndex
    List<Lesson> findByChapterIdOrderByOrderIndexAsc(Long chapterId);

    // Đếm số lesson trong một chapter
    long countByChapterId(Long chapterId);
}

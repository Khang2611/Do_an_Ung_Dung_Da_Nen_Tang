package org.example.khoahoc.repository;

import org.example.khoahoc.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long>, JpaSpecificationExecutor<Chapter> {
    List<Chapter> findByCourseId(Long courseId);

    // Lấy chapters của khóa học theo thứ tự orderIndex
    List<Chapter> findByCourseIdOrderByOrderIndexAsc(Long courseId);

    // Đếm số chapter của một khóa học
    long countByCourseId(Long courseId);
}

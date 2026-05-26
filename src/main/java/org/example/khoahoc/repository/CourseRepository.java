package org.example.khoahoc.repository;

import org.example.khoahoc.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    // Lấy danh sách khóa học theo danh mục
    List<Course> findByCategoryCategoryId(Long categoryId);

    // Tìm kiếm theo tiêu đề (không phân biệt hoa thường)
    List<Course> findByTitleContainingIgnoreCase(String title);

    // Tìm kiếm theo tiêu đề trong một danh mục cụ thể
    List<Course> findByCategoryCategoryIdAndTitleContainingIgnoreCase(Long categoryId, String title);

    // Lấy khóa học theo khoảng giá
    List<Course> findByPriceBetween(Double minPrice, Double maxPrice);

    // Sắp xếp theo ngày tạo mới nhất
    List<Course> findAllByOrderByCreatedDateDesc();
}

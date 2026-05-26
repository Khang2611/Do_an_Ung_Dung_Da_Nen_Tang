package org.example.khoahoc.repository;

import org.example.khoahoc.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    // Kiểm tra tồn tại theo tên (dùng khi tạo mới để tránh trùng lặp)
    boolean existsByName(String name);

    // Tìm theo tên chính xác
    Optional<Category> findByName(String name);

    // Tìm kiếm theo tên (không phân biệt hoa thường)
    List<Category> findByNameContainingIgnoreCase(String name);
}

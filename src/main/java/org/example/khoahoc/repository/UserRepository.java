package org.example.khoahoc.repository;

import org.example.khoahoc.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    // Kiểm tra tồn tại theo email (dùng khi đăng ký)
    boolean existsByEmail(String email);

    // Tìm theo email (dùng cho flow quên mật khẩu / xác thực)
    Optional<User> findByEmail(String email);
}


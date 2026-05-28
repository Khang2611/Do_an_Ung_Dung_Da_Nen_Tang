package org.example.khoahoc.repository;

import org.example.khoahoc.entity.VideoEncryptionKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VideoEncryptionKeyRepository extends JpaRepository<VideoEncryptionKey, Long> {
    Optional<VideoEncryptionKey> findByLessonId(Long lessonId);
}

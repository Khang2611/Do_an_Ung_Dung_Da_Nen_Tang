package org.example.khoahoc.controller;

import lombok.RequiredArgsConstructor;
import org.example.khoahoc.entity.*;
import org.example.khoahoc.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class VideoTestController {

    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    /**
     * Tạo dữ liệu mẫu để test luồng bảo mật video.
     */
    @PostMapping("/setup-video")
    public ResponseEntity<String> setupTestData() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Bạn cần đăng nhập để chạy test này"));

        // 1. Tạo Course mẫu
        Course course = Course.builder()
                .title("Khóa học Test Bảo mật Video")
                .description("Dành cho việc kiểm tra HLS và Signed URL")
                .price(100.0)
                .build();
        course = courseRepository.save(course);

        // 2. Tạo Chapter mẫu
        Chapter chapter = Chapter.builder()
                .courseId(course.getCourseId())
                .title("Chương 1: Mở đầu")
                .orderIndex(1)
                .build();
        chapter = chapterRepository.save(chapter);

        // 3. Tạo Lesson mẫu (videoUrl trỏ tới file trên MinIO)
        Lesson lesson = Lesson.builder()
                .chapterId(chapter.getChapterId())
                .title("Bài 1: Hướng dẫn HLS")
                .videoUrl("test/playlist.m3u8") // File này cần có trên MinIO bucket
                .orderIndex(1)
                .build();
        lesson = lessonRepository.save(lesson);

        // 4. Tạo Enrollment cho user hiện tại (Để pass Layer 2)
        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(user.getUserId(), course.getCourseId());
        if (existing.isEmpty()) {
            Enrollment enrollment = Enrollment.builder()
                    .userId(user.getUserId())
                    .courseId(course.getCourseId())
                    .status("ACTIVE")
                    .progress(0.0)
                    .build();
            enrollmentRepository.save(enrollment);
        }

        return ResponseEntity.ok("Setup thành công!\n" +
                "CourseId: " + course.getCourseId() + "\n" +
                "LessonId: " + lesson.getLessonId() + "\n" +
                "Bây giờ bạn có thể gọi API: /api/videos/stream/" + lesson.getLessonId() + "/playlist.m3u8");
    }
}

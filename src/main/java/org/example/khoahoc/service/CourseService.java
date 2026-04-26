package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.CourseCreationRequest;
import org.example.khoahoc.dto.request.CourseUpdateRequest;
import org.example.khoahoc.dto.response.CategoryResponse;
import org.example.khoahoc.dto.response.CourseResponse;
import org.example.khoahoc.entity.Category;
import org.example.khoahoc.entity.Course;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.CategoryRepository;
import org.example.khoahoc.repository.CourseRepository;
import org.example.khoahoc.repository.EnrollmentRepository;
import org.example.khoahoc.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CourseService {

    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    EnrollmentRepository enrollmentRepository;
    UserRepository userRepository;

    public CourseResponse createCourse(CourseCreationRequest request) {
        log.info("Creating new course with title: {}", request.getTitle());

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .build();

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            course.setCategory(category);
        }

        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    public CourseResponse getCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return mapToResponse(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getMyCourses() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Long> courseIds = enrollmentRepository.findByUserId(currentUser.getUserId())
                .stream()
                .map(enrollment -> enrollment.getCourseId())
                .collect(Collectors.toList());

        return courseRepository.findAllById(courseIds).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getPrice() != null) course.setPrice(request.getPrice());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            course.setCategory(category);
        }

        course = courseRepository.save(course);
        return mapToResponse(course);
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        courseRepository.delete(course);
    }

    private CourseResponse mapToResponse(Course course) {
        CourseResponse response = CourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .createdDate(course.getCreatedDate())
                .build();

        if (course.getCategory() != null) {
            response.setCategory(CategoryResponse.builder()
                    .categoryId(course.getCategory().getCategoryId())
                    .name(course.getCategory().getName())
                    .createdDate(course.getCategory().getCreatedDate())
                    .build());
        }

        return response;
    }
}

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
import org.example.khoahoc.mapper.CourseMapper;
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
    CourseMapper courseMapper;

    public CourseResponse createCourse(CourseCreationRequest request) {
        log.info("Creating new course with title: {}", request.getTitle());

        Course course = courseMapper.toCourse(request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            course.setCategory(category);
        }

        course = courseRepository.save(course);
        return courseMapper.toCourseResponse(course);
    }

    public CourseResponse getCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return courseMapper.toCourseResponse(course);
    }

    public List<CourseResponse> getAllCourses() {
        return courseMapper.toCourseResponseList(courseRepository.findAll());
    }

    public List<CourseResponse> getMyCourses() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Long> courseIds = enrollmentRepository.findByUserId(currentUser.getUserId())
                .stream()
                .map(enrollment -> enrollment.getCourseId())
                .collect(Collectors.toList());

        return courseMapper.toCourseResponseList(courseRepository.findAllById(courseIds));
    }

    public CourseResponse updateCourse(Long id, CourseUpdateRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        courseMapper.updateCourse(course, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            course.setCategory(category);
        }

        course = courseRepository.save(course);
        return courseMapper.toCourseResponse(course);
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        courseRepository.delete(course);
    }
}

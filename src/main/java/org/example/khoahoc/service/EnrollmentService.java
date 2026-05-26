package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.EnrollmentUpdateRequest;
import org.example.khoahoc.dto.response.EnrollmentResponse;
import org.example.khoahoc.dto.response.MyEnrollmentResponse;
import org.example.khoahoc.entity.Course;
import org.example.khoahoc.entity.Enrollment;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.mapper.EnrollmentMapper;
import org.example.khoahoc.repository.CourseRepository;
import org.example.khoahoc.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EnrollmentService {

    EnrollmentRepository enrollmentRepository;
    EnrollmentMapper enrollmentMapper;
    CourseRepository courseRepository;

    public EnrollmentResponse createEnrollment(EnrollmentCreationRequest request) {
        log.info("Creating new enrollment for userId: {}, courseId: {}", request.getUserId(), request.getCourseId());

        if (enrollmentRepository.findByUserIdAndCourseId(request.getUserId(), request.getCourseId()).isPresent()) {
            throw new AppException(ErrorCode.ENROLLMENT_EXISTED);
        }

        Enrollment enrollment = enrollmentMapper.toEnrollment(request);

        enrollment = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toEnrollmentResponse(enrollment);
    }

    public EnrollmentResponse getEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));
        return enrollmentMapper.toEnrollmentResponse(enrollment);
    }

    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentMapper.toEnrollmentResponseList(enrollmentRepository.findAll());
    }

    public List<EnrollmentResponse> getEnrollmentsByUserId(Long userId) {
        return enrollmentMapper.toEnrollmentResponseList(enrollmentRepository.findByUserId(userId));
    }
    
    public List<EnrollmentResponse> getEnrollmentsByCourseId(Long courseId) {
        return enrollmentMapper.toEnrollmentResponseList(enrollmentRepository.findByCourseId(courseId));
    }

    /**
     * Lấy danh sách khóa học đã đăng ký của user hiện tại,
     * kèm đầy đủ thông tin khóa học (tên, mô tả, giá).
     */
    public List<MyEnrollmentResponse> getMyEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .map(enrollment -> {
                    Course course = courseRepository.findById(enrollment.getCourseId())
                            .orElse(null);
                    return MyEnrollmentResponse.builder()
                            .enrollmentId(enrollment.getEnrollmentId())
                            .status(enrollment.getStatus())
                            .progress(enrollment.getProgress())
                            .enrolledAt(enrollment.getCreatedDate())
                            .courseId(enrollment.getCourseId())
                            .courseTitle(course != null ? course.getTitle() : "Không rõ")
                            .courseDescription(course != null ? course.getDescription() : null)
                            .coursePrice(course != null ? course.getPrice() : null)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public EnrollmentResponse updateEnrollment(Long id, EnrollmentUpdateRequest request) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));

        enrollmentMapper.updateEnrollment(enrollment, request);

        enrollment = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toEnrollmentResponse(enrollment);
    }

    public void deleteEnrollment(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENROLLMENT_NOT_FOUND));
        enrollmentRepository.delete(enrollment);
    }
}

package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.EnrollmentUpdateRequest;
import org.example.khoahoc.dto.response.EnrollmentResponse;
import org.example.khoahoc.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {

    // EnrollmentCreationRequest → Enrollment
    // enrollmentId auto-generated, progress và status set bởi @PrePersist
    @Mapping(target = "enrollmentId", ignore = true)
    @Mapping(target = "progress", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Enrollment toEnrollment(EnrollmentCreationRequest request);

    // Enrollment → EnrollmentResponse (tất cả fields map 1-1)
    EnrollmentResponse toEnrollmentResponse(Enrollment enrollment);

    // Cập nhật Enrollment (chỉ cho phép thay progress và status)
    @Mapping(target = "enrollmentId", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateEnrollment(@MappingTarget Enrollment enrollment, EnrollmentUpdateRequest request);
}

package org.example.khoahoc.controller;

import tools.jackson.databind.ObjectMapper;
import org.example.khoahoc.config.SecurityConfig;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.EnrollmentUpdateRequest;
import org.example.khoahoc.dto.response.EnrollmentResponse;
import org.example.khoahoc.dto.response.MyEnrollmentResponse;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.enums.Role;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.security.JwtAuthenticationFilter;
import org.example.khoahoc.security.JwtTokenProvider;
import org.example.khoahoc.service.EnrollmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EnrollmentController.class)
@Import({ SecurityConfig.class, JwtAuthenticationFilter.class })
public class EnrollmentControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private EnrollmentService enrollmentService;

        @MockitoBean
        private UserRepository userRepository;

        @MockitoBean
        private JwtTokenProvider jwtTokenProvider;

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testCreateEnrollment_Success() throws Exception {
                EnrollmentCreationRequest request = EnrollmentCreationRequest.builder()
                                .userId(1L)
                                .courseId(10L)
                                .build();

                EnrollmentResponse response = EnrollmentResponse.builder()
                                .enrollmentId(1L)
                                .userId(1L)
                                .courseId(10L)
                                .status("ACTIVE")
                                .createdDate(LocalDateTime.now())
                                .build();

                when(enrollmentService.createEnrollment(any(EnrollmentCreationRequest.class))).thenReturn(response);

                mockMvc.perform(post("/api/enrollments")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.enrollmentId").value(1L));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testCreateEnrollment_Conflict() throws Exception {
                EnrollmentCreationRequest request = EnrollmentCreationRequest.builder()
                                .userId(1L)
                                .courseId(10L)
                                .build();

                when(enrollmentService.createEnrollment(any(EnrollmentCreationRequest.class)))
                                .thenThrow(new AppException(ErrorCode.ENROLLMENT_EXISTED));

                mockMvc.perform(post("/api/enrollments")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.code").value(4091));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testGetMyEnrollments_Success() throws Exception {
                User user = User.builder()
                                .userId(1L)
                                .username("user")
                                .role(Role.USER)
                                .build();

                MyEnrollmentResponse enrollment = MyEnrollmentResponse.builder()
                                .enrollmentId(1L)
                                .courseId(10L)
                                .courseTitle("Java Core")
                                .build();

                when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
                when(enrollmentService.getMyEnrollments(1L)).thenReturn(List.of(enrollment));

                mockMvc.perform(get("/api/enrollments/me"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result[0].courseTitle").value("Java Core"));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testGetAllEnrollments_Forbidden() throws Exception {
                mockMvc.perform(get("/api/enrollments"))
                                .andExpect(status().isInternalServerError()); // Do GlobalExceptionHandler chuyển
                                                                              // AccessDenied thành 500
        }

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        public void testGetAllEnrollments_Success() throws Exception {
                EnrollmentResponse response = EnrollmentResponse.builder()
                                .enrollmentId(1L)
                                .build();

                when(enrollmentService.getAllEnrollments()).thenReturn(List.of(response));

                mockMvc.perform(get("/api/enrollments"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result[0].enrollmentId").value(1L));
        }

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        public void testUpdateEnrollment_Success() throws Exception {
                EnrollmentUpdateRequest request = EnrollmentUpdateRequest.builder()
                                .status("COMPLETED")
                                .build();

                EnrollmentResponse response = EnrollmentResponse.builder()
                                .enrollmentId(1L)
                                .status("COMPLETED")
                                .build();

                when(enrollmentService.updateEnrollment(eq(1L), any(EnrollmentUpdateRequest.class)))
                                .thenReturn(response);

                mockMvc.perform(put("/api/enrollments/1")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.status").value("COMPLETED"));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testUpdateEnrollment_Forbidden() throws Exception {
                EnrollmentUpdateRequest request = EnrollmentUpdateRequest.builder()
                                .status("COMPLETED")
                                .build();

                mockMvc.perform(put("/api/enrollments/1")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isInternalServerError()); // AccessDenied thành 500
        }

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        public void testDeleteEnrollment_Success() throws Exception {
                doNothing().when(enrollmentService).deleteEnrollment(1L);

                mockMvc.perform(delete("/api/enrollments/1")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Xóa đăng ký khóa học thành công."));
        }
}

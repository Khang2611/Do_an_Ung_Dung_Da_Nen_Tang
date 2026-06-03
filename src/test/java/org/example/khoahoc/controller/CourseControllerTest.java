package org.example.khoahoc.controller;

import tools.jackson.databind.ObjectMapper;
import org.example.khoahoc.config.SecurityConfig;
import org.example.khoahoc.dto.request.CourseCreationRequest;
import org.example.khoahoc.dto.request.CourseUpdateRequest;
import org.example.khoahoc.dto.response.CourseResponse;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.security.JwtAuthenticationFilter;
import org.example.khoahoc.security.JwtTokenProvider;
import org.example.khoahoc.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
@Import({ SecurityConfig.class, JwtAuthenticationFilter.class })
public class CourseControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private CourseService courseService;

        @MockitoBean
        private JwtTokenProvider jwtTokenProvider;

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        public void testCreateCourse_Success() throws Exception {
                CourseCreationRequest request = CourseCreationRequest.builder()
                                .title("Java Core")
                                .description("Java Core for Beginners")
                                .price(199.99)
                                .build();

                CourseResponse response = CourseResponse.builder()
                                .courseId(1L)
                                .title("Java Core")
                                .description("Java Core for Beginners")
                                .price(199.99)
                                .build();

                when(courseService.createCourse(any(CourseCreationRequest.class))).thenReturn(response);

                mockMvc.perform(post("/api/courses")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.title").value("Java Core"));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testCreateCourse_Forbidden() throws Exception {
                CourseCreationRequest request = CourseCreationRequest.builder()
                                .title("Java Core")
                                .description("Java Core for Beginners")
                                .build();

                mockMvc.perform(post("/api/courses")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isInternalServerError());
        }

        @Test
        public void testGetAllCourses_Success() throws Exception {
                CourseResponse response = CourseResponse.builder()
                                .courseId(1L)
                                .title("Java Core")
                                .build();

                when(courseService.getAllCourses()).thenReturn(List.of(response));

                mockMvc.perform(get("/api/courses"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result[0].title").value("Java Core"));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testGetMyCourse_Success() throws Exception {
                CourseResponse response = CourseResponse.builder()
                                .courseId(2L)
                                .title("Spring Boot")
                                .build();

                when(courseService.getMyCourses()).thenReturn(List.of(response));

                mockMvc.perform(get("/api/courses/myCourse"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result[0].title").value("Spring Boot"));
        }

        @Test
        public void testGetMyCourse_Unauthorized() throws Exception {
                mockMvc.perform(get("/api/courses/myCourse"))
                                .andExpect(status().isInternalServerError());
        }

        @Test
        public void testGetCourse_Success() throws Exception {
                CourseResponse response = CourseResponse.builder()
                                .courseId(1L)
                                .title("Java Core")
                                .build();

                when(courseService.getCourse(1L)).thenReturn(response);

                mockMvc.perform(get("/api/courses/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.title").value("Java Core"));
        }

        @Test
        public void testGetCourse_NotFound() throws Exception {
                when(courseService.getCourse(999L)).thenThrow(new AppException(ErrorCode.COURSE_NOT_FOUND));

                mockMvc.perform(get("/api/courses/999"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.code").value(4042))
                                .andExpect(jsonPath("$.message").value(ErrorCode.COURSE_NOT_FOUND.getMessage()));
        }

        @Test
        @WithMockUser(username = "teacher", roles = { "TEACHER" })
        public void testUpdateCourse_Success() throws Exception {
                CourseUpdateRequest request = CourseUpdateRequest.builder()
                                .title("Java Core Advanced")
                                .build();

                CourseResponse response = CourseResponse.builder()
                                .courseId(1L)
                                .title("Java Core Advanced")
                                .build();

                when(courseService.updateCourse(eq(1L), any(CourseUpdateRequest.class))).thenReturn(response);

                mockMvc.perform(put("/api/courses/1")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.title").value("Java Core Advanced"));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testUpdateCourse_Forbidden() throws Exception {
                CourseUpdateRequest request = CourseUpdateRequest.builder()
                                .title("Java Core Advanced")
                                .build();

                mockMvc.perform(put("/api/courses/1")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isInternalServerError());
        }

        @Test
        @WithMockUser(username = "admin", roles = { "ADMIN" })
        public void testDeleteCourse_Success() throws Exception {
                doNothing().when(courseService).deleteCourse(1L);

                mockMvc.perform(delete("/api/courses/1")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Xóa khóa học thành công."));
        }

        @Test
        @WithMockUser(username = "user", roles = { "USER" })
        public void testDeleteCourse_Forbidden() throws Exception {
                mockMvc.perform(delete("/api/courses/1")
                                .with(csrf()))
                                .andExpect(status().isInternalServerError());
        }
}

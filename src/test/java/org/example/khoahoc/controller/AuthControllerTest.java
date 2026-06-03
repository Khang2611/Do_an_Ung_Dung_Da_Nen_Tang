package org.example.khoahoc.controller;

import tools.jackson.databind.ObjectMapper;
import org.example.khoahoc.dto.request.LoginRequest;
import org.example.khoahoc.dto.request.LogoutRequest;
import org.example.khoahoc.dto.request.RefreshTokenRequest;
import org.example.khoahoc.dto.request.UserCreationRequest;
import org.example.khoahoc.dto.response.*;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.service.AuthService;
import org.example.khoahoc.service.UserService;
import org.example.khoahoc.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDateTime;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.context.annotation.Import;
import org.example.khoahoc.config.SecurityConfig;
import org.example.khoahoc.security.JwtAuthenticationFilter;

@WebMvcTest(AuthController.class)
@Import({ SecurityConfig.class, JwtAuthenticationFilter.class })
public class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private AuthService authService;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private JwtTokenProvider jwtTokenProvider;

        @Test
        public void testRegister_Success() throws Exception {
                UserCreationRequest request = UserCreationRequest.builder()
                                .username("testuser")
                                .password("Test@1234")
                                .email("testuser@gmail.com")
                                .fullName("Test User")
                                .phoneNumber("0987654321")
                                .build();

                UserResponse response = UserResponse.builder()
                                .userId(1L)
                                .username("testuser")
                                .email("testuser@gmail.com")
                                .fullName("Test User")
                                .role("USER")
                                .createdDate(LocalDateTime.now())
                                .build();

                when(userService.createUser(any(UserCreationRequest.class))).thenReturn(response);

                mockMvc.perform(post("/api/auth/register")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công."))
                                .andExpect(jsonPath("$.result.username").value("testuser"));
        }

        @Test
        public void testRegister_UsernameExisted() throws Exception {
                UserCreationRequest request = UserCreationRequest.builder()
                                .username("existinguser")
                                .password("Test@1234")
                                .email("testuser@gmail.com")
                                .fullName("Test User")
                                .phoneNumber("0987654321")
                                .build();

                when(userService.createUser(any(UserCreationRequest.class)))
                                .thenThrow(new AppException(ErrorCode.USER_EXISTED));

                mockMvc.perform(post("/api/auth/register")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.code").value(4090))
                                .andExpect(jsonPath("$.message").value(ErrorCode.USER_EXISTED.getMessage()));
        }

        @Test
        public void testRegister_InvalidInput() throws Exception {
                // Mật khẩu không chứa ký tự đặc biệt, chữ hoa
                UserCreationRequest request = UserCreationRequest.builder()
                                .username("us") // Quá ngắn (min = 3)
                                .password("simplepwd")
                                .email("testuser@gmail.com")
                                .fullName("Test User")
                                .phoneNumber("123") // Số điện thoại không hợp lệ
                                .build();

                mockMvc.perform(post("/api/auth/register")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isInternalServerError());
        }

        @Test
        public void testLogin_Success() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username("testuser")
                                .password("Test@1234")
                                .build();

                LoginResponse response = LoginResponse.builder()
                                .userId(1L)
                                .username("testuser")
                                .email("testuser@gmail.com")
                                .fullName("Test User")
                                .role("USER")
                                .accessToken("mock-access-token")
                                .refreshToken("mock-refresh-token")
                                .tokenType("Bearer")
                                .expiresIn(3600L)
                                .build();

                when(authService.login(any(LoginRequest.class), any())).thenReturn(response);

                mockMvc.perform(post("/api/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.accessToken").value("mock-access-token"))
                                .andExpect(jsonPath("$.result.refreshToken").value("mock-refresh-token"));
        }

        @Test
        public void testLogin_InvalidCredentials() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username("testuser")
                                .password("wrongpwd")
                                .build();

                when(authService.login(any(LoginRequest.class), any()))
                                .thenThrow(new AppException(ErrorCode.INVALID_CREDENTIALS));

                mockMvc.perform(post("/api/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.code").value(4010));
        }

        @Test
        @WithMockUser(username = "testuser", roles = { "USER" })
        public void testGetMe_Success() throws Exception {
                UserResponse response = UserResponse.builder()
                                .userId(1L)
                                .username("testuser")
                                .email("testuser@gmail.com")
                                .fullName("Test User")
                                .role("USER")
                                .build();

                when(userService.getUserByUsername("testuser")).thenReturn(response);

                mockMvc.perform(get("/api/auth/me"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.username").value("testuser"));
        }

        @Test
        public void testRefreshToken_Success() throws Exception {
                RefreshTokenRequest request = RefreshTokenRequest.builder()
                                .refreshToken("valid-refresh-token")
                                .build();

                RefreshTokenResponse response = RefreshTokenResponse.builder()
                                .accessToken("new-access-token")
                                .refreshToken("valid-refresh-token")
                                .tokenType("Bearer")
                                .expiresIn(3600L)
                                .build();

                when(authService.refreshAccessToken(any(RefreshTokenRequest.class))).thenReturn(response);

                mockMvc.perform(post("/api/auth/refresh")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result.accessToken").value("new-access-token"));
        }

        @Test
        public void testLogoutCurrentDevice_Success() throws Exception {
                LogoutRequest request = LogoutRequest.builder()
                                .refreshToken("valid-refresh-token")
                                .build();

                doNothing().when(authService).logout("valid-refresh-token");

                mockMvc.perform(post("/api/auth/logout")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Đăng xuất tại thiết bị hiện tại thành công."));
        }

        @Test
        @WithMockUser(username = "testuser", roles = { "USER" })
        public void testLogoutAllDevices_Success() throws Exception {
                doNothing().when(authService).logoutAllDevices("testuser");

                mockMvc.perform(post("/api/auth/logout-all")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Đăng xuất ở tất cả thiết bị thành công."));
        }

        @Test
        @WithMockUser(username = "testuser", roles = { "USER" })
        public void testGetActiveSessions_Success() throws Exception {
                ActiveSessionResponse session = ActiveSessionResponse.builder()
                                .sessionId(1L)
                                .deviceFingerprint("Chrome-Windows")
                                .lastUsed(LocalDateTime.now())
                                .expiresAt(LocalDateTime.now().plusDays(7))
                                .build();

                when(authService.getActiveSessions("testuser")).thenReturn(List.of(session));

                mockMvc.perform(get("/api/auth/sessions"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.result[0].sessionId").value(1L))
                                .andExpect(jsonPath("$.result[0].deviceFingerprint").value("Chrome-Windows"));
        }

        @Test
        @WithMockUser(username = "testuser", roles = { "USER" })
        public void testKickSession_Success() throws Exception {
                doNothing().when(authService).kickSession("testuser", 1L);

                mockMvc.perform(delete("/api/auth/sessions/1")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Thu hồi session thành công."));
        }

        @Test
        @WithMockUser(username = "testuser", roles = { "USER" })
        public void testKickSession_Unauthorized() throws Exception {
                doThrow(new AppException(ErrorCode.UNAUTHORIZED_ACTION))
                                .when(authService).kickSession("testuser", 2L);

                mockMvc.perform(delete("/api/auth/sessions/2")
                                .with(csrf()))
                                .andExpect(status().isForbidden())
                                .andExpect(jsonPath("$.code").value(4031))
                                .andExpect(jsonPath("$.message").value(ErrorCode.UNAUTHORIZED_ACTION.getMessage()));
        }
}

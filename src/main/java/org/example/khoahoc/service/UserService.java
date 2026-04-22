package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.UserCreationRequest;
import org.example.khoahoc.dto.request.UserUpdateRequest;
import org.example.khoahoc.dto.response.UserResponse;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.enums.Role;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserCreationRequest request) {
        log.info("Creating new user with username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Role userRole = Role.USER;
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                Role requestedRole = Role.valueOf(request.getRole().toUpperCase());
                // Không cho phép tự đăng ký quyền ADMIN qua API public
                if (requestedRole == Role.ADMIN) {
                    throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Hoặc bạn có thể dùng mã lỗi custom "UNAUTHORIZED_ROLE"
                }
                userRole = requestedRole;
            } catch (IllegalArgumentException e) {
                // Nếu truyền string tào lao thì mặc định vẫn là USER
                userRole = Role.USER;
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(userRole)
                .build();

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return mapToResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse updateUserProfile(Long id, String authenticatedUsername, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra quyền sở hữu (chỉ cho phép cập nhật chính mình hoặc là ADMIN)
        User currentUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                
        if (!user.getUserId().equals(currentUser.getUserId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Cần có mã lỗi UNAUTHORIZED thích hợp
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getFullName() != null) user.setFullName(request.getFullName());

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public UserResponse updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (role != null && !role.isEmpty()) {
            try {
                Role newRole = Role.valueOf(role.toUpperCase());
                user.setRole(newRole);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role provided: {}", role);
                throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
        }

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdDate(user.getCreatedDate())
                .build();
    }
}

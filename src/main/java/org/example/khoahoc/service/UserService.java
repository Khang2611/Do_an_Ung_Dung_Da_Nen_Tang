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
import org.example.khoahoc.mapper.UserMapper;
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
    UserMapper userMapper;

    public UserResponse createUser(UserCreationRequest request) {
        log.info("Creating new user with username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Role userRole = Role.USER;
        if (request.getRole() != null && !request.getRole().isEmpty()) {
            try {
                Role requestedRole = Role.valueOf(request.getRole().toUpperCase());
                // KhÃ´ng cho phÃ©p tá»± Ä‘Äƒng kÃ½ quyá»n ADMIN qua API public
                if (requestedRole == Role.ADMIN) {
                    throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
                }
                userRole = requestedRole;
            } catch (IllegalArgumentException e) {
                // Náº¿u truyá»n string tÃ o lao thÃ¬ máº·c Ä‘á»‹nh váº«n lÃ  USER
                userRole = Role.USER;
            }
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userMapper.toUserResponseList(userRepository.findAll());
    }

    public UserResponse updateUserProfile(Long id, String authenticatedUsername, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiá»ƒm tra quyá»n sá»Ÿ há»¯u (chá»‰ cho phÃ©p cáº­p nháº­t chÃ­nh mÃ¬nh hoáº·c lÃ  ADMIN)
        User currentUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!user.getUserId().equals(currentUser.getUserId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
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
                throw new AppException(ErrorCode.INVALID_ROLE);
            }
        }

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }
}

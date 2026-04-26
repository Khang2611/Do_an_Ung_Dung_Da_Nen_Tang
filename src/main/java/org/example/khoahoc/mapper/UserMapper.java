package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.UserCreationRequest;
import org.example.khoahoc.dto.request.UserUpdateRequest;
import org.example.khoahoc.dto.response.UserResponse;
import org.example.khoahoc.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // UserCreationRequest → User
    // Bỏ qua userId (auto-generated) và role (xử lý trong service)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    User toUser(UserCreationRequest request);

    // User → UserResponse
    // role là enum → convert sang String
    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().name() : null)")
    UserResponse toUserResponse(User user);

    // UserUpdateRequest → User (chỉ cập nhật email và fullName)
    // username, password, userId, role, createdDate không được phép thay đổi qua mapper này
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}

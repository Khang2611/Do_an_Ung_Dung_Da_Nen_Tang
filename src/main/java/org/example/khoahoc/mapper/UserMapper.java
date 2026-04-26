package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.UserCreationRequest;
import org.example.khoahoc.dto.request.UserUpdateRequest;
import org.example.khoahoc.dto.response.UserResponse;
import org.example.khoahoc.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    User toUser(UserCreationRequest request);

    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().name() : null)")
    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponseList(List<User> users);

    // username, password, userId, role, createdDate không được phép thay đổi qua
    // mapper này
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}

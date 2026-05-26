package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    Long userId;
    String accessToken;
    String refreshToken;
    String tokenType;
    String username;
    String email;
    String fullName;
    String role;
    long expiresIn; // milliseconds (access token)
}

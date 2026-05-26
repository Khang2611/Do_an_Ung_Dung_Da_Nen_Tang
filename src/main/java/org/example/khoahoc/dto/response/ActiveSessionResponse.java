package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ActiveSessionResponse {
    Long sessionId;
    String deviceFingerprint;
    LocalDateTime lastUsed;
    LocalDateTime expiresAt;
}

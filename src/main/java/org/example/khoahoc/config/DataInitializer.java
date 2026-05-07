package org.example.khoahoc.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.enums.Role;
import org.example.khoahoc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final io.minio.MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.email}")
    private String adminEmail;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            User admin = User.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName("System Administrator")
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            log.info(" TÃ i khoáº£n ADMIN Ä‘Ã£ Ä‘Æ°á»£c khá»Ÿi táº¡o â€” username: '{}', email: '{}'",
                    adminUsername, adminEmail);
        } else {
            log.info("â„¹ TÃ i khoáº£n ADMIN '{}' Ä‘Ã£ tá»“n táº¡i, bá» qua khá»Ÿi táº¡o.", adminUsername);
        }

        // Táº¡o file playlist máº«u trÃªn MinIO Ä‘á»ƒ test
        try {
            String objectName = "test/playlist.m3u8";
            String content = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:10\n#EXTINF:10.0,\nsegment1.ts\n#EXTINF:10.0,\nsegment2.ts\n#EXT-X-ENDLIST";

            minioClient.putObject(
                io.minio.PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(new java.io.ByteArrayInputStream(content.getBytes()), content.length(), -1)
                    .contentType("application/x-mpegURL")
                    .build()
            );
            log.info("âœ… ÄÃ£ khá»Ÿi táº¡o file video giáº£ láº­p: {}/{}", bucketName, objectName);
        } catch (Exception e) {
            log.warn("âš ï¸ KhÃ´ng thá»ƒ táº¡o file giáº£ láº­p trÃªn MinIO (CÃ³ thá»ƒ MinIO chÆ°a cháº¡y): {}", e.getMessage());
        }
    }
}

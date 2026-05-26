package org.example.khoahoc.security;

import org.example.khoahoc.config.JwtProperties;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class JwtPasswordEncoder implements PasswordEncoder {

    private final JwtProperties jwtProperties;
    private static final String HMAC_ALGO = "HmacSHA256";

    public JwtPasswordEncoder(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            SecretKeySpec secretKeySpec = new SecretKeySpec(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8), HMAC_ALGO);
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(rawPassword.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error encoding password with JWT secret", e);
        }
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        
        String newEncode = encode(rawPassword);
        return newEncode.equals(encodedPassword);
    }
}

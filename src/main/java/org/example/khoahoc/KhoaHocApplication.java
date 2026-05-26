package org.example.khoahoc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class KhoaHocApplication {

    public static void main(String[] args) {
        SpringApplication.run(KhoaHocApplication.class, args);
    }

}

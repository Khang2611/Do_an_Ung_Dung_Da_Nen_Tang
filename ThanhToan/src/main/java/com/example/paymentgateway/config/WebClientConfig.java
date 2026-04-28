package com.example.paymentgateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${khoahoc.base-url}")
    private String khoahocBaseUrl;

    @Bean
    public WebClient khoahocWebClient() {
        return WebClient.builder()
                .baseUrl(khoahocBaseUrl)
                .build();
    }
}

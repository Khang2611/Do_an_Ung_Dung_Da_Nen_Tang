package org.example.khoahoc.service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.util.Enumeration;
import java.util.List;
import java.util.Locale;

@Service
public class VideoBrowserGuard {

    private static final List<String> COCCOC_SIGNATURES = List.of(
            "coccoc",
            "coc_coc",
            "coc coc",
            "cốc cốc",
            "coc-coc",
            "coc_coc_browser"
    );

    public void rejectUnsupportedBrowser(HttpServletRequest request) {
        if (isCocCocBrowser(request)) {
            throw new AppException(ErrorCode.UNSUPPORTED_BROWSER);
        }
    }

    private boolean isCocCocBrowser(HttpServletRequest request) {
        if (request == null) {
            return false;
        }

        String fingerprint = buildBrowserFingerprint(request).toLowerCase(Locale.ROOT);
        return COCCOC_SIGNATURES.stream().anyMatch(fingerprint::contains);
    }

    private String buildBrowserFingerprint(HttpServletRequest request) {
        StringBuilder fingerprint = new StringBuilder();
        appendHeader(fingerprint, request, HttpHeaders.USER_AGENT);
        appendHeader(fingerprint, request, "sec-ch-ua");
        appendHeader(fingerprint, request, "sec-ch-ua-full-version-list");

        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames != null && headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (headerName != null && headerName.toLowerCase(Locale.ROOT).contains("coc")) {
                fingerprint.append(' ').append(headerName).append(' ').append(request.getHeader(headerName));
            }
        }
        return fingerprint.toString();
    }

    private void appendHeader(StringBuilder builder, HttpServletRequest request, String headerName) {
        String value = request.getHeader(headerName);
        if (value != null) {
            builder.append(' ').append(value);
        }
    }
}

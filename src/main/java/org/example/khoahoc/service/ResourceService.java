package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import org.example.khoahoc.dto.request.ResourceCreationRequest;
import org.example.khoahoc.dto.request.ResourceUpdateRequest;
import org.example.khoahoc.dto.response.ResourceResponse;
import org.example.khoahoc.entity.Resource;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.mapper.ResourceMapper;
import org.example.khoahoc.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class ResourceService {

    final ResourceRepository resourceRepository;
    final ResourceMapper resourceMapper;
    final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    String bucketName;

    @Value("${minio.access-key}")
    String accessKey;

    @Value("${minio.secret-key}")
    String secretKey;

    @Value("${minio.public-endpoint:http://localhost:9000}")
    String publicEndpoint;

    public ResourceResponse createResource(ResourceCreationRequest request) {
        log.info("Creating new resource with name: {}", request.getName());

        Resource resource = resourceMapper.toResource(request);

        resource = resourceRepository.save(resource);
        return resourceMapper.toResourceResponse(resource);
    }

    public ResourceResponse uploadResource(Long lessonId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Resource file is empty");
        }

        String originalName = file.getOriginalFilename() == null ? "resource" : file.getOriginalFilename();
        String objectName = "resources/lesson_" + lessonId + "/" + UUID.randomUUID() + "-" + sanitizeFileName(originalName);
        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception e) {
            log.error("Could not upload resource to MinIO", e);
            throw new RuntimeException("Could not upload resource file");
        }

        Resource resource = Resource.builder()
                .lessonId(lessonId)
                .name(originalName)
                .url(objectName)
                .type(resolveType(originalName, contentType))
                .build();

        return resourceMapper.toResourceResponse(resourceRepository.save(resource));
    }

    public String getSignedDownloadUrl(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        try {
            return MinioClient.builder()
                    .endpoint(publicEndpoint)
                    .credentials(accessKey, secretKey)
                    .region("us-east-1")
                    .build()
                    .getPresignedObjectUrl(
                            GetPresignedObjectUrlArgs.builder()
                                    .method(Method.GET)
                                    .bucket(bucketName)
                                    .object(resource.getUrl())
                                    .expiry(15, TimeUnit.MINUTES)
                                    .build()
                    );
        } catch (Exception e) {
            log.error("Could not sign resource download URL", e);
            throw new RuntimeException("Could not create resource download link");
        }
    }

    public ResourceResponse getResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return resourceMapper.toResourceResponse(resource);
    }

    public List<ResourceResponse> getAllResources() {
        return resourceMapper.toResourceResponseList(resourceRepository.findAll());
    }

    public List<ResourceResponse> getResourcesByLessonId(Long lessonId) {
        return resourceMapper.toResourceResponseList(resourceRepository.findByLessonId(lessonId));
    }

    public ResourceResponse updateResource(Long id, ResourceUpdateRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        resourceMapper.updateResource(resource, request);

        resource = resourceRepository.save(resource);
        return resourceMapper.toResourceResponse(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (resource.getUrl() != null && resource.getUrl().startsWith("resources/")) {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(resource.getUrl())
                                .build()
                );
            } catch (Exception e) {
                log.warn("Could not remove resource object from MinIO: {}", resource.getUrl(), e);
            }
        }
        resourceRepository.delete(resource);
    }

    private String resolveType(String fileName, String contentType) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex >= 0 && dotIndex < fileName.length() - 1) {
            return fileName.substring(dotIndex + 1).toUpperCase(Locale.ROOT);
        }
        return contentType;
    }

    private String sanitizeFileName(String fileName) {
        String normalized = Normalizer.normalize(fileName, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-zA-Z0-9._-]", "-")
                .replaceAll("-+", "-");
        return normalized.isBlank() ? "resource" : normalized;
    }
}

package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.ResourceCreationRequest;
import org.example.khoahoc.dto.request.ResourceUpdateRequest;
import org.example.khoahoc.dto.response.ResourceResponse;
import org.example.khoahoc.entity.Resource;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ResourceService {

    ResourceRepository resourceRepository;

    public ResourceResponse createResource(ResourceCreationRequest request) {
        log.info("Creating new resource with name: {}", request.getName());

        Resource resource = Resource.builder()
                .lessonId(request.getLessonId())
                .name(request.getName())
                .url(request.getUrl())
                .type(request.getType())
                .build();

        resource = resourceRepository.save(resource);
        return mapToResponse(resource);
    }

    public ResourceResponse getResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapToResponse(resource);
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ResourceResponse> getResourcesByLessonId(Long lessonId) {
        return resourceRepository.findByLessonId(lessonId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ResourceResponse updateResource(Long id, ResourceUpdateRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (request.getName() != null) resource.setName(request.getName());
        if (request.getUrl() != null) resource.setUrl(request.getUrl());
        if (request.getType() != null) resource.setType(request.getType());

        resource = resourceRepository.save(resource);
        return mapToResponse(resource);
    }

    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        resourceRepository.delete(resource);
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .resourceId(resource.getResourceId())
                .lessonId(resource.getLessonId())
                .name(resource.getName())
                .url(resource.getUrl())
                .type(resource.getType())
                .createdDate(resource.getCreatedDate())
                .build();
    }
}

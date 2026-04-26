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
import org.example.khoahoc.mapper.ResourceMapper;
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
    ResourceMapper resourceMapper;

    public ResourceResponse createResource(ResourceCreationRequest request) {
        log.info("Creating new resource with name: {}", request.getName());

        Resource resource = resourceMapper.toResource(request);

        resource = resourceRepository.save(resource);
        return resourceMapper.toResourceResponse(resource);
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
        resourceRepository.delete(resource);
    }
}

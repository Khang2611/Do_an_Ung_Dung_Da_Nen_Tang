package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.ResourceCreationRequest;
import org.example.khoahoc.dto.request.ResourceUpdateRequest;
import org.example.khoahoc.dto.response.ResourceResponse;
import org.example.khoahoc.entity.Resource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ResourceMapper {

    @Mapping(target = "resourceId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    Resource toResource(ResourceCreationRequest request);

    ResourceResponse toResourceResponse(Resource resource);
    List<ResourceResponse> toResourceResponseList(List<Resource> resources);

    @Mapping(target = "resourceId", ignore = true)
    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateResource(@MappingTarget Resource resource, ResourceUpdateRequest request);
}

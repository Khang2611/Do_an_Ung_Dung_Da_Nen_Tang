package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.ChapterCreationRequest;
import org.example.khoahoc.dto.request.ChapterUpdateRequest;
import org.example.khoahoc.dto.response.ChapterResponse;
import org.example.khoahoc.entity.Chapter;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.mapper.ChapterMapper;
import org.example.khoahoc.repository.ChapterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ChapterService {

    ChapterRepository chapterRepository;
    ChapterMapper chapterMapper;

    public ChapterResponse createChapter(ChapterCreationRequest request) {
        log.info("Creating new chapter with title: {}", request.getTitle());

        Chapter chapter = chapterMapper.toChapter(request);

        chapter = chapterRepository.save(chapter);
        return chapterMapper.toChapterResponse(chapter);
    }

    public ChapterResponse getChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));
        return chapterMapper.toChapterResponse(chapter);
    }

    public List<ChapterResponse> getAllChapters() {
        return chapterMapper.toChapterResponseList(chapterRepository.findAll());
    }

    public List<ChapterResponse> getChaptersByCourseId(Long courseId) {
        return chapterMapper.toChapterResponseList(chapterRepository.findByCourseId(courseId));
    }

    public ChapterResponse updateChapter(Long id, ChapterUpdateRequest request) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));

        chapterMapper.updateChapter(chapter, request);

        chapter = chapterRepository.save(chapter);
        return chapterMapper.toChapterResponse(chapter);
    }

    public void deleteChapter(Long id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND));
        chapterRepository.delete(chapter);
    }
}

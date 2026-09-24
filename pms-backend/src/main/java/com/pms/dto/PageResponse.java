package com.pms.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/** page is 1-based to match the frontend pagination. */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(p.getContent(), p.getNumber() + 1, p.getSize(), p.getTotalElements(), p.getTotalPages());
    }
}

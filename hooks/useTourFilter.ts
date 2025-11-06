"use client";

import { useState, useCallback } from "react";

/**
 * @file useTourFilter.ts
 * @description 관광지 필터링 훅
 *
 * 관광지 목록의 필터 상태를 관리하는 훅입니다.
 * 지역 코드와 관광 타입 필터를 관리하며, 필터 변경 시 React Query를 재조회합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 필터 섹션
 */

interface TourFilterState {
  areaCode?: string;
  contentTypeId?: string;
}

/**
 * 관광지 필터링 훅
 *
 * @returns 필터 상태 및 필터 변경 함수
 */
export function useTourFilter() {
  const [filters, setFilters] = useState<TourFilterState>({});

  /**
   * 지역 필터 변경
   */
  const setAreaCode = useCallback((areaCode: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      areaCode: areaCode || undefined,
    }));
  }, []);

  /**
   * 관광 타입 필터 변경
   */
  const setContentTypeId = useCallback((contentTypeId: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      contentTypeId: contentTypeId || undefined,
    }));
  }, []);

  /**
   * 필터 초기화
   */
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * 필터 적용 여부 확인
   */
  const hasActiveFilters = Boolean(filters.areaCode || filters.contentTypeId);

  return {
    filters,
    setAreaCode,
    setContentTypeId,
    resetFilters,
    hasActiveFilters,
  };
}

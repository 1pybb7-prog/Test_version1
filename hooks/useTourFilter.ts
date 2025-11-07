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
  petFriendly?: boolean; // 반려동물 동반 가능 여부
  petSize?: "small" | "medium" | "large" | undefined; // 반려동물 크기
  petType?: "dog" | "cat" | undefined; // 반려동물 종류
  petPlace?: "indoor" | "outdoor" | undefined; // 실내/실외 동반 가능 여부
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
   * 반려동물 동반 가능 필터 변경
   */
  const setPetFriendly = useCallback((petFriendly: boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      petFriendly: petFriendly || undefined,
    }));
  }, []);

  /**
   * 반려동물 크기 필터 변경
   */
  const setPetSize = useCallback(
    (petSize: "small" | "medium" | "large" | undefined) => {
      setFilters((prev) => ({
        ...prev,
        petSize: petSize || undefined,
      }));
    },
    [],
  );

  /**
   * 반려동물 종류 필터 변경
   */
  const setPetType = useCallback((petType: "dog" | "cat" | undefined) => {
    setFilters((prev) => ({
      ...prev,
      petType: petType || undefined,
    }));
  }, []);

  /**
   * 반려동물 입장 가능 장소 필터 변경
   */
  const setPetPlace = useCallback(
    (petPlace: "indoor" | "outdoor" | undefined) => {
      setFilters((prev) => ({
        ...prev,
        petPlace: petPlace || undefined,
      }));
    },
    [],
  );

  /**
   * 필터 초기화
   */
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * 필터 적용 여부 확인
   */
  const hasActiveFilters = Boolean(
    filters.areaCode ||
      filters.contentTypeId ||
      filters.petFriendly ||
      filters.petSize ||
      filters.petType ||
      filters.petPlace,
  );

  return {
    filters,
    setAreaCode,
    setContentTypeId,
    setPetFriendly,
    setPetSize,
    setPetType,
    setPetPlace,
    resetFilters,
    hasActiveFilters,
  };
}

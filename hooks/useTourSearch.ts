"use client";

import { useQuery } from "@tanstack/react-query";
import type { TourItem } from "@/lib/types/tour";
import { searchTour } from "@/actions/search-tour";

/**
 * @file useTourSearch.ts
 * @description 관광지 검색 훅
 *
 * React Query를 사용하여 관광지 검색을 수행하는 훅입니다.
 * Server Action을 통해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * 필터 옵션(areaCode, contentTypeId)을 지원합니다.
 *
 * @see {@link /docs/prd.md#23-키워드-검색} - PRD 문서의 키워드 검색 섹션
 */

interface UseTourSearchOptions {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  enabled?: boolean; // 검색 실행 여부 제어
}

/**
 * 관광지 검색 훅
 *
 * @param options - 검색 옵션
 * @returns React Query 결과
 */
export function useTourSearch(options: UseTourSearchOptions) {
  const { keyword, areaCode, contentTypeId, numOfRows, pageNo, enabled } =
    options;

  return useQuery({
    queryKey: [
      "tours",
      "search",
      keyword,
      areaCode,
      contentTypeId,
      numOfRows,
      pageNo,
    ],
    queryFn: async (): Promise<TourItem[]> => {
      if (!keyword || keyword.trim() === "") {
        return [];
      }
      return await searchTour({
        keyword: keyword.trim(),
        areaCode,
        contentTypeId,
        numOfRows: numOfRows ?? 10,
        pageNo: pageNo ?? 1,
      });
    },
    enabled: enabled !== false && Boolean(keyword && keyword.trim() !== ""),
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    retry: 1, // 실패 시 1회 재시도
  });
}

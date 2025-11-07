"use client";

import { useQuery } from "@tanstack/react-query";
import type { TourItem } from "@/lib/types/tour";
import { getTourList } from "@/actions/get-tour-list";

/**
 * @file useTourList.ts
 * @description 관광지 목록 조회 훅
 *
 * React Query를 사용하여 관광지 목록을 조회하는 훅입니다.
 * Server Action을 통해 서버 사이드에서 한국관광공사 API를 호출합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 */

interface UseTourListOptions {
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
  enabled?: boolean; // 쿼리 실행 여부 제어
}

/**
 * 관광지 목록 조회 훅
 *
 * @param options - 조회 옵션
 * @returns React Query 결과
 */
export function useTourList(options: UseTourListOptions = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["tours", "list", options],
    queryFn: async (): Promise<TourItem[]> => {
      return await getTourList({
        areaCode: options.areaCode,
        contentTypeId: options.contentTypeId,
        numOfRows: options.numOfRows ?? 10,
        pageNo: options.pageNo ?? 1,
      });
    },
    enabled,
    staleTime: 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    retry: 1, // 실패 시 1회 재시도
  });
}

/**
 * @file tour-sorter.ts
 * @description 관광지 정렬 유틸리티 함수
 *
 * 관광지 목록을 정렬하는 함수들을 제공합니다.
 * 클라이언트 사이드 정렬을 수행합니다.
 *
 * 정렬 옵션:
 * 1. 최신순 (modifiedtime 기준 내림차순)
 * 2. 이름순 (title 기준 가나다순 오름차순)
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 정렬 옵션 섹션
 */

import type { TourItem } from "@/lib/types/tour";

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "name";

/**
 * 관광지를 최신순으로 정렬
 *
 * modifiedtime을 기준으로 내림차순 정렬합니다.
 * modifiedtime이 같으면 contentid로 정렬합니다.
 *
 * @param tours - 정렬할 관광지 배열
 * @returns 정렬된 관광지 배열
 */
export function sortByLatest(tours: TourItem[]): TourItem[] {
  return [...tours].sort((a, b) => {
    // modifiedtime 비교 (내림차순: 최신순)
    const timeA = a.modifiedtime || "0";
    const timeB = b.modifiedtime || "0";

    if (timeA !== timeB) {
      return timeB.localeCompare(timeA); // 내림차순
    }

    // modifiedtime이 같으면 contentid로 정렬
    return a.contentid.localeCompare(b.contentid);
  });
}

/**
 * 관광지를 이름순으로 정렬 (가나다순)
 *
 * title을 기준으로 한글 가나다순 정렬을 수행합니다.
 * localeCompare를 사용하여 한글 정렬을 지원합니다.
 *
 * @param tours - 정렬할 관광지 배열
 * @returns 정렬된 관광지 배열
 */
export function sortByName(tours: TourItem[]): TourItem[] {
  return [...tours].sort((a, b) => {
    const titleA = a.title || "";
    const titleB = b.title || "";

    // 한글 가나다순 정렬 (오름차순)
    return titleA.localeCompare(titleB, "ko", {
      numeric: true,
      sensitivity: "base",
    });
  });
}

/**
 * 정렬 옵션에 따라 관광지를 정렬
 *
 * @param tours - 정렬할 관광지 배열
 * @param sortOption - 정렬 옵션 ("latest" | "name")
 * @returns 정렬된 관광지 배열
 */
export function sortTours(
  tours: TourItem[],
  sortOption: SortOption,
): TourItem[] {
  switch (sortOption) {
    case "latest":
      return sortByLatest(tours);
    case "name":
      return sortByName(tours);
    default:
      // 기본값: 최신순
      return sortByLatest(tours);
  }
}

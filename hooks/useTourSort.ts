/**
 * @file useTourSort.ts
 * @description 관광지 정렬 상태 관리 훅
 *
 * 정렬 옵션 상태를 관리하는 훅입니다.
 * 로컬 상태로 정렬 옵션을 저장하고 관리합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 정렬 옵션 섹션
 */

import { useState } from "react";
import type { SortOption } from "@/lib/utils/tour-sorter";

/**
 * 정렬 상태 관리 훅
 *
 * @returns 정렬 옵션과 정렬 변경 함수
 */
export function useTourSort() {
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  /**
   * 정렬 옵션 변경 핸들러
   *
   * @param option - 정렬 옵션 ("latest" | "name")
   */
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    console.log("[useTourSort] 정렬 옵션 변경:", option);
  };

  /**
   * 정렬 옵션 초기화
   */
  const resetSort = () => {
    setSortOption("latest");
    console.log("[useTourSort] 정렬 옵션 초기화");
  };

  return {
    sortOption,
    setSortOption: handleSortChange,
    resetSort,
  };
}


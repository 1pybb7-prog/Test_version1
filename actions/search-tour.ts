"use server";

import { searchKeyword } from "@/lib/api/tour-api";
import type { TourItem } from "@/lib/types/tour";

/**
 * @file search-tour.ts
 * @description 관광지 검색 Server Action
 *
 * 서버 사이드에서 한국관광공사 API를 호출하여 키워드로 관광지를 검색합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#23-키워드-검색} - PRD 문서의 키워드 검색 섹션
 */

interface SearchTourOptions {
  keyword: string;
  areaCode?: string;
  contentTypeId?: string;
  numOfRows?: number;
  pageNo?: number;
}

/**
 * 관광지 검색 Server Action
 *
 * @param options - 검색 옵션
 * @returns 검색 결과 목록
 */
export async function searchTour(
  options: SearchTourOptions,
): Promise<TourItem[]> {
  try {
    if (!options.keyword || options.keyword.trim() === "") {
      throw new Error("검색 키워드를 입력해주세요.");
    }

    return await searchKeyword(options.keyword.trim(), {
      areaCode: options.areaCode,
      contentTypeId: options.contentTypeId,
      numOfRows: options.numOfRows ?? 10,
      pageNo: options.pageNo ?? 1,
    });
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes("TOUR_API_KEY")) {
        throw new Error(
          "관광지 데이터를 불러오려면 API 키가 필요합니다. .env.local 파일에 TOUR_API_KEY를 설정해주세요.",
        );
      }
      if (
        error.message.includes("API 호출 실패") ||
        error.message.includes("네트워크")
      ) {
        throw new Error(
          "네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
        );
      }
      if (error.message.includes("API 에러")) {
        throw new Error(
          "관광지 정보를 검색하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
      // 키워드 검증 에러는 그대로 전달
      if (error.message.includes("검색 키워드")) {
        throw error;
      }
    }
    throw error;
  }
}

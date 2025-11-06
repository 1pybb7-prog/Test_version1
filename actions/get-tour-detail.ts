"use server";

import { getDetailCommon } from "@/lib/api/tour-api";
import type { TourDetail } from "@/lib/types/tour";

/**
 * @file get-tour-detail.ts
 * @description 관광지 상세 정보 조회 Server Action
 *
 * 서버 사이드에서 한국관광공사 API를 호출하여 관광지 상세 정보를 조회합니다.
 * .env.local의 TOUR_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#24-상세페이지} - PRD 문서의 상세페이지 섹션
 */

/**
 * 관광지 상세 정보 조회 Server Action
 *
 * @param contentId - 콘텐츠ID
 * @returns 관광지 상세 정보
 */
export async function getTourDetail(
  contentId: string,
): Promise<TourDetail | null> {
  try {
    if (!contentId || contentId.trim() === "") {
      throw new Error("관광지 ID가 필요합니다.");
    }

    return await getDetailCommon(contentId);
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
          "관광지 정보를 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
      }
    }
    throw error;
  }
}

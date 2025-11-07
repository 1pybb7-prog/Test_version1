"use server";

import { getDetailPetTour } from "@/lib/api/tour-api";
import type { PetTourInfo } from "@/lib/types/tour";

/**
 * @file get-tour-pet.ts
 * @description 반려동물 동반 여행 정보 조회 Server Action
 *
 * 서버 사이드에서 한국관광공사 반려동물 동반여행 API를 호출하여 반려동물 동반 정보를 조회합니다.
 * .env.local의 NEXT_PUBLIC_TOUR_PET_API_KEY를 사용합니다.
 *
 * @see {@link /docs/prd.md#25-반려동물-동반-여행} - PRD 문서의 반려동물 동반 여행 섹션
 */

/**
 * 반려동물 동반 여행 정보 조회 Server Action
 *
 * @param contentId - 콘텐츠ID
 * @returns 반려동물 동반 여행 정보
 */
export async function getTourPet(
  contentId: string,
): Promise<PetTourInfo | null> {
  try {
    if (!contentId || contentId.trim() === "") {
      throw new Error("관광지 ID가 필요합니다.");
    }

    const result = await getDetailPetTour(contentId);
    // null이 반환되는 것은 정상적인 응답 (해당 관광지에 반려동물 정보가 없는 경우)
    return result;
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      if (error.message.includes("TOUR_PET_API_KEY")) {
        console.error(
          "[getTourPet] API 키 미설정:",
          "NEXT_PUBLIC_TOUR_PET_API_KEY를 .env.local에 설정해주세요.",
        );
        // API 키가 없어도 null을 반환하여 앱이 크래시되지 않도록 처리
        return null;
      }
      if (
        error.message.includes("API 호출 실패") ||
        error.message.includes("네트워크")
      ) {
        console.warn(`[getTourPet] 네트워크 에러: ${contentId}`, error);
        // 네트워크 에러도 null을 반환하여 앱이 크래시되지 않도록 처리
        return null;
      }
      if (error.message.includes("API 에러")) {
        console.warn(`[getTourPet] API 에러: ${contentId}`, error);
        // API 에러도 null을 반환하여 앱이 크래시되지 않도록 처리
        return null;
      }
    }
    // 기타 에러도 null을 반환
    console.warn(`[getTourPet] 예상치 못한 에러: ${contentId}`, error);
    return null;
  }
}

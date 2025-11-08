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
      console.warn("[getTourPet] 관광지 ID가 없음:", { contentId });
      throw new Error("관광지 ID가 필요합니다.");
    }

    console.log(`[getTourPet] 반려동물 정보 조회 시작: ${contentId}`, {
      NODE_ENV: process.env.NODE_ENV,
      // 환경 변수 상태 확인 (디버깅용)
      TOUR_API_KEY: process.env.TOUR_API_KEY ? "설정됨" : "미설정",
      NEXT_PUBLIC_TOUR_API_KEY: process.env.NEXT_PUBLIC_TOUR_API_KEY
        ? "설정됨"
        : "미설정",
      TOUR_PET_API_KEY: process.env.TOUR_PET_API_KEY ? "설정됨" : "미설정",
      NEXT_PUBLIC_TOUR_PET_API_KEY: process.env.NEXT_PUBLIC_TOUR_PET_API_KEY
        ? "설정됨"
        : "미설정",
    });

    const result = await getDetailPetTour(contentId);

    // null이 반환되는 것은 정상적인 응답 (해당 관광지에 반려동물 정보가 없는 경우)
    if (result) {
      console.log(`[getTourPet] 반려동물 정보 조회 성공: ${contentId}`, {
        hasPetInfo: Boolean(
          result.acmpyTypeCd ||
            result.acmpyPsblCpam ||
            result.acmpyNeedMtr ||
            result.etcAcmpyInfo,
        ),
      });
    } else {
      console.log(`[getTourPet] 반려동물 정보 없음: ${contentId}`);
    }

    return result;
  } catch (error) {
    // API 키 미설정 또는 네트워크 에러 시 명확한 에러 메시지
    if (error instanceof Error) {
      // 배포 환경에서 문제 파악을 위한 상세 로그
      console.error(`[getTourPet] 에러 발생: ${contentId}`, {
        errorMessage: error.message,
        errorStack: error.stack,
        NODE_ENV: process.env.NODE_ENV,
        errorType: error.constructor.name,
        // 환경 변수 상태 확인 (디버깅용)
        TOUR_API_KEY: process.env.TOUR_API_KEY ? "설정됨" : "미설정",
        NEXT_PUBLIC_TOUR_API_KEY: process.env.NEXT_PUBLIC_TOUR_API_KEY
          ? "설정됨"
          : "미설정",
        TOUR_PET_API_KEY: process.env.TOUR_PET_API_KEY ? "설정됨" : "미설정",
        NEXT_PUBLIC_TOUR_PET_API_KEY: process.env.NEXT_PUBLIC_TOUR_PET_API_KEY
          ? "설정됨"
          : "미설정",
      });

      if (
        error.message.includes("TOUR_PET_API_KEY") ||
        error.message.includes("TOUR_API_KEY")
      ) {
        console.error(`[getTourPet] API 키 미설정: ${contentId}`, {
          message:
            "NEXT_PUBLIC_TOUR_PET_API_KEY 또는 TOUR_API_KEY를 환경 변수에 설정해주세요.",
          NODE_ENV: process.env.NODE_ENV,
        });
        // API 키가 없어도 null을 반환하여 앱이 크래시되지 않도록 처리
        return null;
      }
      if (
        error.message.includes("API 호출 실패") ||
        error.message.includes("네트워크")
      ) {
        console.warn(`[getTourPet] 네트워크 에러: ${contentId}`, {
          error: error.message,
          NODE_ENV: process.env.NODE_ENV,
        });
        // 네트워크 에러도 null을 반환하여 앱이 크래시되지 않도록 처리
        return null;
      }
      if (error.message.includes("API 에러")) {
        console.warn(`[getTourPet] API 에러: ${contentId}`, {
          error: error.message,
          NODE_ENV: process.env.NODE_ENV,
        });
        // API 에러도 null을 반환하여 앱이 크래시되지 않도록 처리
        return null;
      }
    }
    // 기타 에러도 null을 반환
    console.warn(`[getTourPet] 예상치 못한 에러: ${contentId}`, {
      error: error instanceof Error ? error.message : String(error),
      NODE_ENV: process.env.NODE_ENV,
    });
    return null;
  }
}

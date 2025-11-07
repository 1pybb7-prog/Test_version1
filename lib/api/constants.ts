/**
 * @file constants.ts
 * @description API 공통 상수
 *
 * 한국관광공사 공공 API에서 사용하는 공통 상수들을 정의합니다.
 */

/**
 * API Base URL
 */
export const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * API 공통 파라미터
 */
export const TOUR_API_COMMON_PARAMS = {
  MobileOS: "ETC",
  MobileApp: "MyTrip",
  _type: "json",
} as const;

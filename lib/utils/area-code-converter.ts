/**
 * @file area-code-converter.ts
 * @description 지역코드 변환 유틸리티
 *
 * 한국관광공사 API의 지역코드(areacode)를 텍스트로 변환하는 함수를 제공합니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 지역 필터 섹션
 */

/**
 * 지역코드 ID를 텍스트로 변환
 *
 * @param areacode - 지역코드 (1, 2, 3, 4, 5, 6, 7, 8, 31, 32, 33, 34, 35, 36, 37, 38, 39)
 * @returns 지역명 텍스트
 */
export function getAreaName(areacode: string): string {
  const areaMap: Record<string, string> = {
    "1": "서울",
    "2": "인천",
    "3": "대전",
    "4": "대구",
    "5": "광주",
    "6": "부산",
    "7": "울산",
    "8": "세종",
    "31": "경기",
    "32": "강원",
    "33": "충북",
    "34": "충남",
    "35": "경북",
    "36": "경남",
    "37": "전북",
    "38": "전남",
    "39": "제주",
  };

  return areaMap[areacode] || "기타";
}

/**
 * 지역코드 ID 목록
 */
export const AREA_CODES = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
] as const;

/**
 * 지역 옵션 목록 (필터 등에서 사용)
 */
export const AREA_OPTIONS = AREA_CODES.map((code) => ({
  value: code,
  label: getAreaName(code),
}));

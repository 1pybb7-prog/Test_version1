/**
 * @file stats.ts
 * @description 통계 관련 타입 정의
 *
 * 관광지 통계 정보를 표현하는 타입 정의입니다.
 *
 * 주요 타입:
 * 1. RegionStats - 지역별 통계 (지역코드, 지역명, 관광지 개수)
 * 2. TypeStats - 타입별 통계 (타입ID, 타입명, 관광지 개수)
 * 3. StatsSummary - 전체 통계 요약 (전체 개수, Top 3 지역, Top 3 타입, 마지막 업데이트 시간)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

/**
 * 지역별 통계 타입
 *
 * 지역코드별 관광지 개수를 집계한 결과를 표현합니다.
 */
export interface RegionStats {
  /** 지역코드 (시/도) */
  areacode: string;
  /** 지역명 (예: "서울", "부산", "제주") */
  name: string;
  /** 해당 지역의 관광지 개수 */
  count: number;
}

/**
 * 타입별 통계 타입
 *
 * 관광 타입별 관광지 개수를 집계한 결과를 표현합니다.
 */
export interface TypeStats {
  /** 콘텐츠타입ID (관광 타입: 12, 14, 15, 25, 28, 32, 38, 39) */
  contenttypeid: string;
  /** 타입명 (예: "관광지", "문화시설", "음식점") */
  name: string;
  /** 해당 타입의 관광지 개수 */
  count: number;
}

/**
 * 통계 요약 타입
 *
 * 전체 통계 정보를 요약하여 표현합니다.
 * StatsSummary 컴포넌트에서 사용됩니다.
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** Top 3 지역 (관광지 개수 기준 내림차순) */
  topRegions: RegionStats[];
  /** Top 3 타입 (관광지 개수 기준 내림차순) */
  topTypes: TypeStats[];
  /** 마지막 업데이트 시간 (ISO 8601 형식: YYYY-MM-DDTHH:mm:ss.sssZ) */
  lastUpdated: string;
}

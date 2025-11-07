/**
 * @file stats-api.ts
 * @description 통계 데이터 수집 API
 *
 * 관광지 통계 정보를 수집하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 집계 (getRegionStats)
 * 2. 타입별 관광지 개수 집계 (getTypeStats)
 * 3. 전체 통계 요약 (getStatsSummary)
 *
 * 성능 최적화:
 * - 병렬 API 호출로 성능 최적화
 * - 에러 처리 및 재시도 로직
 * - 데이터 캐싱 설정 (revalidate: 3600)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

import { AREA_CODES, getAreaName } from "@/lib/utils/area-code-converter";
import {
  TOUR_TYPE_IDS,
  getTourTypeName,
} from "@/lib/utils/tour-type-converter";
import type { RegionStats, StatsSummary, TypeStats } from "@/lib/types/stats";
import { TOUR_API_BASE_URL, TOUR_API_COMMON_PARAMS } from "@/lib/api/constants";

/**
 * API Base URL
 */
const BASE_URL = TOUR_API_BASE_URL;

/**
 * API 공통 파라미터
 */
const COMMON_PARAMS = TOUR_API_COMMON_PARAMS;

/**
 * API 응답 타입 (totalCount 포함)
 */
interface ApiResponseWithCount<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * API 서비스 키 가져오기
 */
function getServiceKey(): string {
  const key =
    process.env.NEXT_PUBLIC_TOUR_API_KEY ||
    process.env.TOUR_API_KEY ||
    process.env.NEXT_PUBLIC_TOUR_API_KEY?.trim() ||
    process.env.TOUR_API_KEY?.trim();

  if (!key || key.trim() === "") {
    throw new Error(
      "TOUR_API_KEY 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY를 설정해주세요.",
    );
  }

  return key.trim();
}

/**
 * API 호출하여 totalCount 가져오기
 *
 * @param endpoint - API 엔드포인트
 * @param params - API 파라미터
 * @returns totalCount
 */
async function fetchTotalCount(
  endpoint: string,
  params: Record<string, string | number | undefined>,
): Promise<number> {
  const serviceKey = getServiceKey();

  const searchParams = new URLSearchParams({
    serviceKey,
    ...COMMON_PARAMS,
    ...Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined),
    ),
  });

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  console.log(`[Stats API] totalCount 조회: ${endpoint}`, {
    params,
    url: url.substring(0, 100) + "...",
  });

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}`,
      );
    }

    const data: ApiResponseWithCount<unknown> = await response.json();

    // API 에러 체크
    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API 에러: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`,
      );
    }

    // totalCount 반환
    return data.response.body.totalCount || 0;
  } catch (error) {
    console.error(`[Stats API] totalCount 조회 실패: ${endpoint}`, error);
    throw error;
  }
}

/**
 * 재시도 설정
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1초
} as const;

/**
 * 재시도 로직이 포함된 API 호출
 *
 * @param fn - 실행할 함수
 * @param retries - 남은 재시도 횟수
 * @returns 함수 실행 결과
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(
        `[Stats API] 재시도 중... (남은 횟수: ${retries})`,
        error instanceof Error ? error.message : String(error),
      );
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_CONFIG.retryDelay),
      );
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

/**
 * 지역별 관광지 개수 집계
 *
 * 모든 지역코드에 대해 API를 호출하여 각 지역의 관광지 개수를 집계합니다.
 * 병렬 처리로 성능을 최적화합니다.
 *
 * @returns 지역별 통계 배열
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  console.log("[Stats API] 지역별 통계 수집 시작");

  try {
    // 모든 지역코드에 대해 병렬로 API 호출
    const statsPromises = AREA_CODES.map(async (areacode) => {
      return withRetry(async () => {
        console.log(
          `[Stats API] 지역 통계 수집 중: ${areacode} (${getAreaName(
            areacode,
          )})`,
        );

        // API를 호출하여 totalCount 가져오기
        const count = await fetchTotalCount("/areaBasedList2", {
          areaCode: areacode,
          numOfRows: 1,
          pageNo: 1,
        });

        console.log(
          `[Stats API] 지역 통계 수집 완료: ${areacode} (${getAreaName(
            areacode,
          )}) - ${count}개`,
        );

        return {
          areacode,
          name: getAreaName(areacode),
          count,
        } as RegionStats;
      });
    });

    // 모든 지역 통계를 병렬로 수집
    const stats = await Promise.all(statsPromises);

    // 개수 기준 내림차순 정렬
    const sortedStats = stats.sort((a, b) => b.count - a.count);

    console.log(
      "[Stats API] 지역별 통계 수집 완료:",
      sortedStats.length,
      "개 지역",
    );

    return sortedStats;
  } catch (error) {
    console.error("[Stats API] 지역별 통계 수집 실패:", error);
    throw error;
  }
}

/**
 * 타입별 관광지 개수 집계
 *
 * 모든 타입ID에 대해 API를 호출하여 각 타입의 관광지 개수를 집계합니다.
 * 병렬 처리로 성능을 최적화합니다.
 *
 * @returns 타입별 통계 배열
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  console.log("[Stats API] 타입별 통계 수집 시작");

  try {
    // 모든 타입ID에 대해 병렬로 API 호출
    const statsPromises = TOUR_TYPE_IDS.map(async (contenttypeid) => {
      return withRetry(async () => {
        console.log(
          `[Stats API] 타입 통계 수집 중: ${contenttypeid} (${getTourTypeName(
            contenttypeid,
          )})`,
        );

        // API를 호출하여 totalCount 가져오기
        const count = await fetchTotalCount("/areaBasedList2", {
          contentTypeId: contenttypeid,
          numOfRows: 1,
          pageNo: 1,
        });

        console.log(
          `[Stats API] 타입 통계 수집 완료: ${contenttypeid} (${getTourTypeName(
            contenttypeid,
          )}) - ${count}개`,
        );

        return {
          contenttypeid,
          name: getTourTypeName(contenttypeid),
          count,
        } as TypeStats;
      });
    });

    // 모든 타입 통계를 병렬로 수집
    const stats = await Promise.all(statsPromises);

    // 개수 기준 내림차순 정렬
    const sortedStats = stats.sort((a, b) => b.count - a.count);

    console.log(
      "[Stats API] 타입별 통계 수집 완료:",
      sortedStats.length,
      "개 타입",
    );

    return sortedStats;
  } catch (error) {
    console.error("[Stats API] 타입별 통계 수집 실패:", error);
    throw error;
  }
}

/**
 * 전체 통계 요약
 *
 * 지역별 통계와 타입별 통계를 병렬로 수집하여 전체 통계 요약을 생성합니다.
 *
 * @returns 통계 요약 정보
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  console.log("[Stats API] 전체 통계 요약 수집 시작");

  try {
    // 지역별 통계와 타입별 통계를 병렬로 수집
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 전체 관광지 수 계산 (지역별 통계의 합계)
    const totalCount = regionStats.reduce((sum, stat) => sum + stat.count, 0);

    // Top 3 지역 추출
    const topRegions = regionStats.slice(0, 3);

    // Top 3 타입 추출
    const topTypes = typeStats.slice(0, 3);

    // 마지막 업데이트 시간 (현재 시간)
    const lastUpdated = new Date().toISOString();

    const summary: StatsSummary = {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated,
    };

    console.log("[Stats API] 전체 통계 요약 수집 완료:", {
      totalCount,
      topRegionsCount: topRegions.length,
      topTypesCount: topTypes.length,
      lastUpdated,
    });

    return summary;
  } catch (error) {
    console.error("[Stats API] 전체 통계 요약 수집 실패:", error);
    throw error;
  }
}

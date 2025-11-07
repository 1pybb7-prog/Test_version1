"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { StatsSummary } from "@/lib/types/stats";
import { cn } from "@/lib/utils";
import { BarChart3, MapPin, Tag, Clock } from "lucide-react";

/**
 * @file StatsSummary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 관광지 통계 정보를 카드 형태로 요약하여 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시
 * 2. Top 3 지역 표시
 * 3. Top 3 타입 표시
 * 4. 마지막 업데이트 시간 표시
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

interface StatsSummaryProps {
  /** 통계 요약 데이터 */
  summary?: StatsSummary;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 날짜 포맷팅 함수
 *
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (예: "2024년 1월 1일 12:00")
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  } catch (error) {
    console.error("[StatsSummary] 날짜 포맷팅 실패:", error);
    return dateString;
  }
}

/**
 * 통계 요약 카드 스켈레톤
 */
function StatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* 전체 관광지 수 카드 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>

      {/* Top 지역 카드 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>

      {/* Top 타입 카드 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </div>

      {/* 마지막 업데이트 카드 */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 통계 요약 카드 컴포넌트
 */
export default function StatsSummary({
  summary,
  isLoading = false,
  className,
}: StatsSummaryProps) {
  console.log("[StatsSummary] 렌더링:", { isLoading, hasSummary: !!summary });

  // 로딩 상태
  if (isLoading || !summary) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <StatsSummarySkeleton />
      </div>
    );
  }

  // 전체 관광지 수 포맷팅 (천 단위 구분)
  const formattedTotalCount = summary.totalCount.toLocaleString("ko-KR");

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* 전체 관광지 수 카드 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
              <BarChart3 className="size-5 text-primary" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm text-muted-foreground">전체 관광지 수</p>
              <p className="text-2xl font-bold">{formattedTotalCount}</p>
            </div>
          </div>
        </div>

        {/* Top 3 지역 카드 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
              <MapPin className="size-5 text-primary" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm text-muted-foreground">Top 3 지역</p>
              {summary.topRegions.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {summary.topRegions.map((region, index) => (
                    <div
                      key={region.areacode}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-medium">
                        {index + 1}. {region.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {region.count.toLocaleString("ko-KR")}개
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">데이터 없음</p>
              )}
            </div>
          </div>
        </div>

        {/* Top 3 타입 카드 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
              <Tag className="size-5 text-primary" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm text-muted-foreground">Top 3 타입</p>
              {summary.topTypes.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {summary.topTypes.map((type, index) => (
                    <div
                      key={type.contenttypeid}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-medium">
                        {index + 1}. {type.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {type.count.toLocaleString("ko-KR")}개
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">데이터 없음</p>
              )}
            </div>
          </div>
        </div>

        {/* 마지막 업데이트 카드 */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
              <Clock className="size-5 text-primary" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-sm text-muted-foreground">마지막 업데이트</p>
              <p className="text-sm font-medium">
                {formatDate(summary.lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

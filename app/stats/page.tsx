import type { Metadata } from "next";
import {
  getStatsSummary,
  getRegionStats,
  getTypeStats,
} from "@/lib/api/stats-api";
import StatsSummary from "@/components/stats/StatsSummary";
import RegionChart from "@/components/stats/RegionChart";
import TypeChart from "@/components/stats/TypeChart";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * @file app/stats/page.tsx
 * @description 통계 대시보드 페이지
 *
 * 관광지 통계 정보를 시각화하여 표시하는 대시보드 페이지입니다.
 *
 * 주요 기능:
 * 1. 전체 통계 요약 (전체 관광지 수, Top 지역, Top 타입)
 * 2. 지역별 분포 차트 (Bar Chart)
 * 3. 타입별 분포 차트 (Donut Chart)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

/**
 * 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "통계 대시보드 - My Trip",
    description: "관광지 통계 정보를 확인하고 분석하세요.",
    openGraph: {
      title: "통계 대시보드 - My Trip",
      description: "관광지 통계 정보를 확인하고 분석하세요.",
      type: "website",
      siteName: "My Trip",
    },
    twitter: {
      card: "summary",
      title: "통계 대시보드 - My Trip",
      description: "관광지 통계 정보를 확인하고 분석하세요.",
    },
  };
}

/**
 * 통계 대시보드 페이지 메인 컴포넌트
 *
 * Server Component로 구현하여 초기 로딩 속도를 최적화합니다.
 * 데이터 캐싱은 stats-api.ts에서 설정됩니다 (revalidate: 3600).
 */
export default async function StatsPage() {
  console.log("[StatsPage] 통계 대시보드 페이지 렌더링");

  try {
    // 통계 데이터 수집 (병렬 처리)
    const [summary, regionStats, typeStats] = await Promise.all([
      getStatsSummary(),
      getRegionStats(),
      getTypeStats(),
    ]);

    console.log("[StatsPage] 통계 데이터 수집 완료:", {
      summaryTotalCount: summary.totalCount,
      regionStatsCount: regionStats.length,
      typeStatsCount: typeStats.length,
    });

    return (
      <main className="min-h-[calc(100vh-80px)]">
        {/* 헤더 섹션 */}
        <section className="border-b bg-background">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                통계 대시보드
              </h1>
              <p className="text-muted-foreground">
                관광지 통계 정보를 확인하고 분석하세요
              </p>
            </div>
          </div>
        </section>

        {/* 통계 요약 섹션 */}
        <section className="border-b bg-background">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold sm:text-3xl">통계 요약</h2>
              <StatsSummary summary={summary} isLoading={false} />
            </div>
          </div>
        </section>

        {/* 차트 섹션 */}
        <section className="bg-background">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8">
              {/* 지역별 분포 차트 */}
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  지역별 분포
                </h2>
                <RegionChart data={regionStats} isLoading={false} />
              </div>

              {/* 타입별 분포 차트 */}
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  타입별 분포
                </h2>
                <TypeChart data={typeStats} isLoading={false} />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error("[StatsPage] 통계 데이터 수집 실패:", error);

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error
        ? error.message
        : "통계 데이터를 불러오는 중 오류가 발생했습니다.";

    return (
      <main className="min-h-[calc(100vh-80px)]">
        {/* 헤더 섹션 */}
        <section className="border-b bg-background">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                통계 대시보드
              </h1>
              <p className="text-muted-foreground">
                관광지 통계 정보를 확인하고 분석하세요
              </p>
            </div>
          </div>
        </section>

        {/* 에러 섹션 */}
        <section className="bg-background">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="size-8 text-destructive" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    데이터를 불러올 수 없습니다
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    잠시 후 다시 시도해주세요.
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/stats">
                      <RefreshCw className="mr-2 size-4" />
                      다시 시도
                    </Link>
                  </Button>
                  <Button asChild variant="default">
                    <Link href="/">홈으로</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

"use client";

import TourList from "@/components/TourList";
import TourFilter from "@/components/TourFilter";
import { useTourFilter } from "@/hooks/useTourFilter";

/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 홈페이지에서는 관광지 목록을 표시합니다.
 * 필터 기능을 통해 지역과 관광 타입으로 목록을 필터링할 수 있습니다.
 * 검색, 지도 기능은 향후 추가 예정입니다.
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 홈페이지 레이아웃
 */

export default function Home() {
  const { filters, setAreaCode, setContentTypeId, resetFilters } =
    useTourFilter();

  return (
    <main className="min-h-[calc(100vh-80px)]">
      {/* 헤더 섹션 */}
      <section className="border-b bg-background">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              한국의 아름다운 관광지를 탐험하세요
            </h1>
            <p className="text-muted-foreground">
              전국의 다양한 관광지를 검색하고 둘러보세요
            </p>
          </div>
        </div>
      </section>

      {/* 필터 섹션 */}
      <section className="sticky top-[80px] z-10 border-b bg-background">
        <TourFilter
          areaCode={filters.areaCode}
          contentTypeId={filters.contentTypeId}
          onAreaCodeChange={setAreaCode}
          onContentTypeIdChange={setContentTypeId}
          onReset={resetFilters}
        />
      </section>

      {/* 관광지 목록 섹션 */}
      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <TourList
          areaCode={filters.areaCode}
          contentTypeId={filters.contentTypeId}
          numOfRows={12}
        />
      </section>
    </main>
  );
}

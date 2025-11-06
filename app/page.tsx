"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TourList from "@/components/TourList";
import TourFilter from "@/components/TourFilter";
import TourSearch from "@/components/TourSearch";
import TourSort from "@/components/TourSort";
import TourPagination from "@/components/TourPagination";
import { useTourFilter } from "@/hooks/useTourFilter";
import { useTourSort } from "@/hooks/useTourSort";
import { useTourList } from "@/hooks/useTourList";
import { useTourSearch } from "@/hooks/useTourSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * GoogleMap 컴포넌트 동적 로딩 (SSR 비활성화)
 */
const GoogleMap = dynamic(() => import("@/components/GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">지도를 불러오는 중...</p>
      </div>
    </div>
  ),
});

/**
 * @file page.tsx
 * @description 홈페이지 - 관광지 목록 + 지도
 *
 * 홈페이지에서는 관광지 목록과 지도를 함께 표시합니다.
 * 검색 기능을 통해 키워드로 관광지를 검색할 수 있습니다.
 * 필터 기능을 통해 지역과 관광 타입으로 목록을 필터링할 수 있습니다.
 * 검색과 필터를 동시에 사용할 수 있습니다.
 *
 * 레이아웃:
 * - 데스크톱: 좌측 리스트 + 우측 지도 분할 레이아웃 (50% : 50%)
 * - 모바일: 탭 형태로 리스트/지도 전환
 *
 * 리스트-지도 연동:
 * - 리스트 항목 클릭 시 해당 마커로 지도 이동 및 InfoWindow 표시
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 * @see {@link /docs/prd.md#22-Google-지도-연동} - PRD 문서의 Google 지도 연동 섹션
 * @see {@link /docs/prd.md#23-키워드-검색} - PRD 문서의 키워드 검색 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 홈페이지 레이아웃
 */

export default function Home() {
  const { filters, setAreaCode, setContentTypeId, resetFilters } =
    useTourFilter();
  const { sortOption, setSortOption } = useTourSort();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedTourId, setSelectedTourId] = useState<string | undefined>();
  const [pageNo, setPageNo] = useState(1);
  const numOfRows = 12; // 페이지당 항목 수

  // 검색 모드 여부 확인
  const isSearchMode = Boolean(searchKeyword && searchKeyword.trim() !== "");

  // 필터/검색 변경 시 페이지 리셋
  useEffect(() => {
    setPageNo(1);
    console.log("[Home] 필터/검색 변경으로 페이지 1로 리셋");
  }, [filters.areaCode, filters.contentTypeId, searchKeyword]);

  // 일반 모드: useTourList 사용
  const listQuery = useTourList({
    areaCode: filters.areaCode,
    contentTypeId: filters.contentTypeId,
    numOfRows: 50, // 지도에 표시할 마커 수 증가
    pageNo,
  });

  // 검색 모드: useTourSearch 사용
  const searchQuery = useTourSearch({
    keyword: searchKeyword,
    areaCode: filters.areaCode,
    contentTypeId: filters.contentTypeId,
    numOfRows,
    pageNo,
    enabled: isSearchMode,
  });

  // 현재 사용할 데이터 결정
  const { data: tours = [], isLoading } = isSearchMode
    ? searchQuery
    : listQuery;

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setSelectedTourId(undefined); // 검색 시 선택 초기화
    setPageNo(1); // 검색 시 페이지 1로 리셋
    console.log("[Home] 검색 실행:", keyword);
  };

  /**
   * 검색 초기화 핸들러
   */
  const handleSearchClear = () => {
    setSearchKeyword("");
    setSelectedTourId(undefined);
    setPageNo(1); // 검색 초기화 시 페이지 1로 리셋
    console.log("[Home] 검색 초기화");
  };

  /**
   * 필터 변경 핸들러 (페이지 리셋 포함)
   */
  const handleAreaCodeChange = (areaCode: string | undefined) => {
    setAreaCode(areaCode);
    setPageNo(1);
    console.log("[Home] 지역 필터 변경:", areaCode);
  };

  const handleContentTypeIdChange = (contentTypeId: string | undefined) => {
    setContentTypeId(contentTypeId);
    setPageNo(1);
    console.log("[Home] 관광 타입 필터 변경:", contentTypeId);
  };

  /**
   * 관광지 선택 핸들러
   */
  const handleTourSelect = (tourId: string) => {
    setSelectedTourId(tourId);
    console.log("[Home] 관광지 선택:", tourId);
  };

  /**
   * 관광지 호버 핸들러 (마커 강조)
   */
  const handleTourHover = (tourId: string) => {
    // 호버 시 마커 강조 (선택 사항)
    // useGoogleMap의 highlightMarker를 사용하려면 ref가 필요하므로,
    // 현재는 간단하게 로그만 출력
    console.log("[Home] 관광지 호버:", tourId);
  };

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (page: number) => {
    setPageNo(page);
    // 페이지 변경 시 스크롤을 상단으로 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log("[Home] 페이지 변경:", page);
  };

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

      {/* 검색 섹션 */}
      <section className="sticky top-[80px] z-10 border-b bg-background">
        <TourSearch
          keyword={searchKeyword}
          onKeywordChange={setSearchKeyword}
          onSearch={handleSearch}
          onClear={handleSearchClear}
        />
      </section>

      {/* 필터 섹션 */}
      <section className="sticky top-[140px] z-10 border-b bg-background">
        <TourFilter
          areaCode={filters.areaCode}
          contentTypeId={filters.contentTypeId}
          onAreaCodeChange={handleAreaCodeChange}
          onContentTypeIdChange={handleContentTypeIdChange}
          onReset={resetFilters}
        />
      </section>

      {/* 정렬 섹션 */}
      <section className="sticky top-[200px] z-10 border-b bg-background">
        <TourSort sortOption={sortOption} onSortChange={setSortOption} />
      </section>

      {/* 관광지 목록 + 지도 섹션 */}
      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 데스크톱: 분할 레이아웃 */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-2">
          {/* 좌측: 리스트 */}
          <div className="flex flex-col gap-6">
            <TourList
              keyword={searchKeyword}
              areaCode={filters.areaCode}
              contentTypeId={filters.contentTypeId}
              numOfRows={numOfRows}
              pageNo={pageNo}
              sortOption={sortOption}
              onTourSelect={handleTourSelect}
              onTourHover={handleTourHover}
            />
            {/* 페이지네이션 */}
            {!isLoading && tours.length > 0 && (
              <TourPagination
                currentPage={pageNo}
                itemsPerPage={numOfRows}
                currentItemsCount={tours.length}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* 우측: 지도 */}
          <div className="sticky top-[260px] h-[calc(100vh-260px)]">
            <GoogleMap
              tours={tours}
              selectedTourId={selectedTourId}
              onTourSelect={handleTourSelect}
              className="h-full"
            />
          </div>
        </div>

        {/* 모바일: 탭 전환 */}
        <div className="lg:hidden">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">목록</TabsTrigger>
              <TabsTrigger value="map">지도</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-6">
              <div className="flex flex-col gap-6">
                <TourList
                  keyword={searchKeyword}
                  areaCode={filters.areaCode}
                  contentTypeId={filters.contentTypeId}
                  numOfRows={numOfRows}
                  pageNo={pageNo}
                  sortOption={sortOption}
                  onTourSelect={handleTourSelect}
                  onTourHover={handleTourHover}
                />
                {/* 페이지네이션 */}
                {!isLoading && tours.length > 0 && (
                  <TourPagination
                    currentPage={pageNo}
                    itemsPerPage={numOfRows}
                    currentItemsCount={tours.length}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="map" className="mt-6">
              <div className="h-[600px]">
                <GoogleMap
                  tours={tours}
                  selectedTourId={selectedTourId}
                  onTourSelect={handleTourSelect}
                  className="h-full"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}

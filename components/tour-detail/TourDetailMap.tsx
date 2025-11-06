"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TourDetail } from "@/lib/types/tour";
import { convertTourCoordinates } from "@/lib/utils/coordinate-converter";
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
 * @file TourDetailMap.tsx
 * @description 관광지 상세페이지 지도 섹션 컴포넌트
 *
 * 관광지의 위치를 Google 지도에 표시하고, 길찾기 및 지도 연동 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 단일 관광지 위치 표시 (마커 1개)
 * 2. "길찾기" 버튼 (Google Maps 길찾기 링크)
 * 3. "지도에서 보기" 버튼 (Google Maps 웹/앱 연동)
 *
 * @see {@link /docs/prd.md#244-지도-섹션} - PRD 문서의 지도 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface TourDetailMapProps {
  detail: TourDetail;
  className?: string;
}

/**
 * Google Maps 길찾기 URL 생성
 *
 * @param lat - 위도
 * @param lng - 경도
 * @returns Google Maps 길찾기 URL
 */
function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Google Maps 지도 보기 URL 생성
 *
 * @param lat - 위도
 * @param lng - 경도
 * @param title - 관광지명 (선택 사항)
 * @returns Google Maps 지도 보기 URL
 */
function getMapUrl(lat: number, lng: number, title?: string): string {
  if (title) {
    // 검색 쿼리로 사용 (주소 또는 관광지명)
    const query = encodeURIComponent(title);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  // 좌표로 직접 이동
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export default function TourDetailMap({
  detail,
  className,
}: TourDetailMapProps) {
  // 좌표 변환 (KATEC → WGS84)
  const coordinates = useMemo(() => {
    try {
      if (!detail.mapx || !detail.mapy) {
        return null;
      }
      return convertTourCoordinates(detail.mapx, detail.mapy);
    } catch (error) {
      console.error("[TourDetailMap] 좌표 변환 실패:", error);
      return null;
    }
  }, [detail.mapx, detail.mapy]);

  // TourDetail을 TourItem 형태로 변환 (GoogleMap 컴포넌트용)
  const tourItem = useMemo(() => {
    if (!coordinates) {
      return null;
    }

    return {
      contentid: detail.contentid,
      contenttypeid: detail.contenttypeid,
      title: detail.title,
      addr1: detail.addr1,
      addr2: detail.addr2,
      areacode: "", // TourDetail에는 없지만 TourItem에는 필요
      mapx: detail.mapx,
      mapy: detail.mapy,
      firstimage: detail.firstimage,
      firstimage2: detail.firstimage2,
      tel: detail.tel,
      modifiedtime: "", // TourDetail에는 없지만 TourItem에는 필요
    };
  }, [detail, coordinates]);

  // 좌표가 없을 경우 처리
  if (!coordinates || !tourItem) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">위치 정보</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-5 shrink-0" />
            <p className="text-sm">위치 정보가 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 길찾기 URL
  const directionsUrl = getDirectionsUrl(coordinates.lat, coordinates.lng);
  // 지도 보기 URL
  const mapUrl = getMapUrl(coordinates.lat, coordinates.lng, detail.title);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* 섹션 제목 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">위치 정보</h2>
        <p className="text-sm text-muted-foreground">
          관광지의 위치를 지도에서 확인하세요
        </p>
      </div>

      {/* 지도 */}
      <div className="h-[400px] w-full overflow-hidden rounded-lg border border-border sm:h-[500px]">
        <GoogleMap
          tours={[tourItem]}
          selectedTourId={detail.contentid}
          initialCenter={coordinates}
          initialZoom={15}
          mapId="tour-detail-map"
          className="h-full w-full"
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          variant="default"
          className="flex-1 gap-2"
          onClick={() => {
            console.log("[TourDetailMap] 길찾기 클릭:", directionsUrl);
          }}
        >
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <Navigation className="size-4" />
            길찾기
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => {
            console.log("[TourDetailMap] 지도에서 보기 클릭:", mapUrl);
          }}
        >
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="size-4" />
            지도에서 보기
          </a>
        </Button>
      </div>
    </div>
  );
}

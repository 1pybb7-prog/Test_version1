"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { getTourTypeName } from "@/lib/utils/tour-type-converter";
import { cn } from "@/lib/utils";

/**
 * @file TourCard.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 정보를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (next/image 사용)
 * 2. 관광지명, 주소, 타입 뱃지 표시
 * 3. 클릭 시 상세페이지로 이동
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 관광지 목록 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 카드 레이아웃
 */

interface TourCardProps {
  tour: TourItem;
  className?: string;
  /** 관광지 선택 핸들러 (지도 연동용) */
  onTourSelect?: (tourId: string) => void;
  /** 호버 시 마커 강조 핸들러 (지도 연동용) */
  onTourHover?: (tourId: string) => void;
}

export default function TourCard({
  tour,
  className,
  onTourSelect,
  onTourHover,
}: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const hasImage = Boolean(imageUrl);
  const tourTypeName = getTourTypeName(tour.contenttypeid);
  const detailUrl = `/places/${tour.contentid}`;

  /**
   * 클릭 핸들러 (지도 연동)
   */
  const handleClick = () => {
    if (onTourSelect) {
      onTourSelect(tour.contentid);
      console.log("[TourCard] 관광지 선택:", tour.contentid);
    }
  };

  /**
   * 호버 핸들러 (마커 강조)
   */
  const handleMouseEnter = () => {
    if (onTourHover) {
      onTourHover(tour.contentid);
      console.log("[TourCard] 관광지 호버:", tour.contentid);
    }
  };

  return (
    <Link
      href={detailUrl}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        className,
      )}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-sm">이미지 없음</span>
          </div>
        )}
        {/* 타입 뱃지 */}
        <div className="absolute right-2 top-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            {tourTypeName}
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight group-hover:text-primary">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span className="line-clamp-2">{tour.addr1}</span>
        </div>

        {/* 전화번호 (있는 경우) */}
        {tour.tel && (
          <div className="text-sm text-muted-foreground">{tour.tel}</div>
        )}
      </div>
    </Link>
  );
}

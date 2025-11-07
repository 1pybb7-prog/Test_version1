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
  isSelected?: boolean; // 선택된 상태
  isHovered?: boolean; // 호버된 상태
  onHover?: (tourId: string | undefined) => void; // 호버 핸들러
  petInfo?: {
    acmpyTypeCd?: string;
    acmpyPsblCpam?: string;
    acmpyNeedMtr?: string;
  } | null; // 반려동물 정보
  className?: string;
}

export default function TourCard({
  tour,
  isSelected = false,
  isHovered = false,
  onHover,
  petInfo,
  className,
}: TourCardProps) {
  const imageUrl = tour.firstimage || tour.firstimage2;
  const hasImage = Boolean(imageUrl);
  const tourTypeName = getTourTypeName(tour.contenttypeid);
  const detailUrl = `/places/${tour.contentid}`;

  /**
   * 카드 호버 핸들러
   * 호버 시 지도에 위치 표시
   */
  const handleCardMouseEnter = () => {
    if (onHover) {
      console.log("[TourCard] 카드 호버:", tour.contentid);
      onHover(tour.contentid);
    }
  };

  /**
   * 카드 호버 아웃 핸들러
   */
  const handleCardMouseLeave = () => {
    if (onHover) {
      console.log("[TourCard] 카드 호버 아웃");
      onHover(undefined);
    }
  };

  const cardClassName = cn(
    "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
    isSelected && "ring-2 ring-primary ring-offset-2",
    isHovered && "ring-2 ring-primary/50 ring-offset-1",
    className,
  );

  // 항상 Link로 렌더링하여 클릭 시 상세페이지로 이동
  return (
    <Link
      href={detailUrl}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
      className={cardClassName}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
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
        {/* 타입 뱃지 및 반려동물 아이콘 */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 items-end">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
            {tourTypeName}
          </span>
          {/* 반려동물 동반 가능 아이콘 */}
          {petInfo?.acmpyTypeCd && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <span className="text-sm">🐾</span>
              {petInfo.acmpyPsblCpam && (
                <span className="text-[10px]">
                  {petInfo.acmpyPsblCpam.includes("소형") ||
                  petInfo.acmpyPsblCpam.includes("소")
                    ? "소형"
                    : petInfo.acmpyPsblCpam.includes("중형") ||
                      petInfo.acmpyPsblCpam.includes("중")
                    ? "중형"
                    : petInfo.acmpyPsblCpam.includes("대형") ||
                      petInfo.acmpyPsblCpam.includes("대")
                    ? "대형"
                    : ""}
                </span>
              )}
            </span>
          )}
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

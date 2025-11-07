"use client";

import { MapPin, Tag, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AREA_OPTIONS } from "@/lib/utils/area-code-converter";
import { TOUR_TYPE_OPTIONS } from "@/lib/utils/tour-type-converter";
import { cn } from "@/lib/utils";

/**
 * @file TourFilter.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역과 관광 타입으로 관광지 목록을 필터링하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 단위 선택)
 * 2. 관광 타입 필터
 * 3. 필터 초기화 기능
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 필터 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 필터 레이아웃
 */

interface TourFilterProps {
  areaCode?: string;
  contentTypeId?: string;
  petFriendly?: boolean;
  petSize?: "small" | "medium" | "large" | undefined;
  petType?: "dog" | "cat" | undefined;
  petPlace?: "indoor" | "outdoor" | undefined;
  onAreaCodeChange?: (areaCode: string | undefined) => void;
  onContentTypeIdChange?: (contentTypeId: string | undefined) => void;
  onPetFriendlyChange?: (petFriendly: boolean | undefined) => void;
  onPetSizeChange?: (petSize: "small" | "medium" | "large" | undefined) => void;
  onPetTypeChange?: (petType: "dog" | "cat" | undefined) => void;
  onPetPlaceChange?: (petPlace: "indoor" | "outdoor" | undefined) => void;
  onReset?: () => void;
  className?: string;
}

export default function TourFilter({
  areaCode,
  contentTypeId,
  petFriendly,
  petSize,
  petType,
  petPlace,
  onAreaCodeChange,
  onContentTypeIdChange,
  onPetFriendlyChange,
  onPetSizeChange,
  onPetTypeChange,
  onPetPlaceChange,
  onReset,
  className,
}: TourFilterProps) {
  const hasActiveFilters = Boolean(
    areaCode || contentTypeId || petFriendly || petSize || petType || petPlace,
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 border-b bg-background p-4 sm:gap-6",
        className,
      )}
    >
      {/* 지역 필터 */}
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-muted-foreground" />
        <Select
          value={areaCode || "all"}
          onValueChange={(value) => {
            onAreaCodeChange?.(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px]">
            <SelectValue placeholder="지역 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {AREA_OPTIONS.map((area) => (
              <SelectItem key={area.value} value={area.value}>
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 관광 타입 필터 */}
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-muted-foreground" />
        <Select
          value={contentTypeId || "all"}
          onValueChange={(value) => {
            onContentTypeIdChange?.(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-[140px] sm:w-[160px]">
            <SelectValue placeholder="타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {TOUR_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 반려동물 동반 가능 필터 */}
      <div className="flex items-center gap-2">
        <Heart className="size-4 text-muted-foreground" />
        <Button
          variant={petFriendly ? "default" : "outline"}
          size="sm"
          onClick={() => {
            onPetFriendlyChange?.(!petFriendly);
          }}
          className="gap-2"
        >
          <span className="text-base">🐾</span>
          반려동물 동반 가능
        </Button>
      </div>

      {/* 반려동물 크기 필터 (반려동물 동반 가능이 활성화된 경우에만 표시) */}
      {petFriendly && (
        <div className="flex items-center gap-2">
          <Select
            value={petSize || "all"}
            onValueChange={(value) => {
              onPetSizeChange?.(
                value === "all"
                  ? undefined
                  : (value as "small" | "medium" | "large"),
              );
            }}
          >
            <SelectTrigger className="w-[120px] sm:w-[140px]">
              <SelectValue placeholder="크기 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 크기</SelectItem>
              <SelectItem value="small">소형</SelectItem>
              <SelectItem value="medium">중형</SelectItem>
              <SelectItem value="large">대형</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 필터 초기화 버튼 */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <X className="size-4" />
          필터 초기화
        </Button>
      )}
    </div>
  );
}

"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/lib/utils/tour-sorter";
import { cn } from "@/lib/utils";

/**
 * @file TourSort.tsx
 * @description 관광지 정렬 컴포넌트
 *
 * 관광지 목록을 정렬하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 최신순 정렬 (modifiedtime 기준)
 * 2. 이름순 정렬 (가나다순)
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 정렬 옵션 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 필터 레이아웃
 */

interface TourSortProps {
  sortOption: SortOption;
  onSortChange?: (sortOption: SortOption) => void;
  className?: string;
}

/**
 * 정렬 옵션 라벨
 */
const SORT_OPTIONS = [
  { value: "latest" as const, label: "최신순" },
  { value: "name" as const, label: "이름순" },
] as const;

export default function TourSort({
  sortOption,
  onSortChange,
  className,
}: TourSortProps) {
  /**
   * 정렬 옵션 변경 핸들러
   */
  const handleSortChange = (value: string) => {
    const option = value as SortOption;
    onSortChange?.(option);
    console.log("[TourSort] 정렬 옵션 변경:", option);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b bg-background p-4 sm:gap-6",
        className,
      )}
    >
      {/* 정렬 필터 */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="size-4 text-muted-foreground" />
        <Select value={sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[140px] sm:w-[160px]">
            <SelectValue placeholder="정렬 선택" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

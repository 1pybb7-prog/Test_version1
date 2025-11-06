"use client";

import { useState, KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @file TourSearch.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 검색 키워드 입력
 * 2. 엔터 키 또는 검색 버튼으로 검색 실행
 * 3. 검색 키워드 초기화
 *
 * @see {@link /docs/prd.md#23-키워드-검색} - PRD 문서의 키워드 검색 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 검색창 레이아웃
 */

interface TourSearchProps {
  keyword?: string;
  onKeywordChange?: (keyword: string) => void;
  onSearch?: (keyword: string) => void;
  onClear?: () => void;
  className?: string;
  placeholder?: string;
}

export default function TourSearch({
  keyword: controlledKeyword,
  onKeywordChange,
  onSearch,
  onClear,
  className,
  placeholder = "관광지 검색...",
}: TourSearchProps) {
  const [localKeyword, setLocalKeyword] = useState("");
  const keyword = controlledKeyword ?? localKeyword;

  /**
   * 키워드 변경 핸들러
   */
  const handleKeywordChange = (value: string) => {
    if (onKeywordChange) {
      onKeywordChange(value);
    } else {
      setLocalKeyword(value);
    }
  };

  /**
   * 검색 실행 핸들러
   */
  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      onSearch?.(trimmedKeyword);
    }
  };

  /**
   * 엔터 키 핸들러
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  /**
   * 검색 초기화 핸들러
   */
  const handleClear = () => {
    handleKeywordChange("");
    onClear?.();
  };

  const hasKeyword = Boolean(keyword && keyword.trim());

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b bg-background p-4 sm:gap-4",
        className,
      )}
    >
      {/* 검색 입력 필드 */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 sm:min-w-[300px] md:min-w-[500px]"
        />
        {hasKeyword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 size-6 -translate-y-1/2 p-0"
            aria-label="검색 초기화"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* 검색 버튼 */}
      <Button
        type="button"
        onClick={handleSearch}
        disabled={!hasKeyword}
        className="gap-2"
      >
        <Search className="size-4" />
        검색
      </Button>
    </div>
  );
}

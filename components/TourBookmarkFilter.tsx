"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarkList } from "@/hooks/useBookmarkList";
import { SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * @file TourBookmarkFilter.tsx
 * @description 북마크 필터 컴포넌트
 *
 * 북마크된 관광지만 보여주는 필터 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크 필터 토글
 * 2. 로그인하지 않은 경우 로그인 유도
 * 3. 북마크된 관광지 개수 표시
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 */

interface TourBookmarkFilterProps {
  /** 북마크 필터 활성화 여부 */
  isBookmarkFilterActive: boolean;
  /** 북마크 필터 토글 핸들러 */
  onToggle: () => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 북마크 필터 컴포넌트
 */
export default function TourBookmarkFilter({
  isBookmarkFilterActive,
  onToggle,
  className,
}: TourBookmarkFilterProps) {
  const { bookmarks, isLoading, isAuthenticated } = useBookmarkList();
  const bookmarkCount = bookmarks.length;

  // 로그인하지 않은 경우 로그인 유도 버튼
  if (!isAuthenticated) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <SignInButton mode="modal">
          <Button
            variant="outline"
            size="default"
            className="gap-2"
            aria-label="북마크 필터 (로그인 필요)"
          >
            <Star className="size-4" />
            <span>북마크</span>
          </Button>
        </SignInButton>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="default"
          disabled
          className="gap-2"
          aria-label="북마크 필터 로딩 중"
        >
          <Star className="size-4" />
          <span className="hidden sm:inline">북마크만 보기</span>
          <span className="sm:hidden">북마크</span>
        </Button>
      </div>
    );
  }

  // 북마크가 없는 경우
  if (bookmarkCount === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="default"
          disabled
          className="gap-2"
          aria-label="북마크 없음"
          title="북마크한 관광지가 없습니다"
        >
          <Star className="size-4" />
          <span className="hidden sm:inline">북마크만 보기</span>
          <span className="sm:hidden">북마크</span>
          <span className="text-muted-foreground">({bookmarkCount})</span>
        </Button>
      </div>
    );
  }

  // 북마크 필터 버튼
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={isBookmarkFilterActive ? "default" : "outline"}
        size="default"
        onClick={onToggle}
        className="gap-2"
        aria-label={
          isBookmarkFilterActive ? "북마크 필터 해제" : "북마크 필터 활성화"
        }
        title={
          isBookmarkFilterActive
            ? "모든 관광지 보기"
            : `북마크한 관광지 ${bookmarkCount}개만 보기`
        }
      >
        <Star
          className={cn(
            "size-4",
            isBookmarkFilterActive && "fill-yellow-400 text-yellow-400",
          )}
        />
        <span className="hidden sm:inline">북마크만 보기</span>
        <span className="sm:hidden">북마크</span>
        <span
          className={cn(
            isBookmarkFilterActive
              ? "text-primary-foreground"
              : "text-muted-foreground",
          )}
        >
          ({bookmarkCount})
        </span>
      </Button>
    </div>
  );
}

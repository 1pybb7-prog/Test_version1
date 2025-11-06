"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";
import { SignInButton, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useBookmark } from "@/hooks/useBookmark";
import { cn } from "@/lib/utils";

/**
 * @file BookmarkButton.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지 상세페이지에서 북마크 기능을 제공하는 버튼 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 북마크 상태 표시 (별 아이콘 - 채워짐/비어있음)
 * 2. 북마크 추가/삭제 토글
 * 3. 로그인하지 않은 경우 로그인 유도 모달
 * 4. 로딩 상태 표시
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 * @see {@link /components/tour-detail/ShareButton.tsx} - 유사한 컴포넌트 참고
 */

interface BookmarkButtonProps {
  /** 관광지 콘텐츠 ID */
  contentId: string;
  /** 버튼 크기 (선택사항) */
  size?: "default" | "sm" | "lg" | "icon";
  /** 버튼 스타일 (선택사항) */
  variant?: "default" | "outline" | "ghost" | "secondary";
  /** 추가 클래스명 (선택사항) */
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트
 *
 * 북마크 상태를 표시하고 토글하는 버튼입니다.
 * 로그인하지 않은 경우 로그인 유도 모달을 표시합니다.
 */
export default function BookmarkButton({
  contentId,
  size = "default",
  variant = "outline",
  className,
}: BookmarkButtonProps) {
  const {
    isBookmarked,
    isLoading,
    isMutating,
    isAuthenticated,
    toggleBookmark,
    error,
  } = useBookmark(contentId);

  /**
   * 북마크 토글 핸들러
   */
  const handleToggle = async () => {
    try {
      await toggleBookmark();
      if (isBookmarked) {
        toast.success("북마크가 삭제되었습니다.");
        console.log("[BookmarkButton] 북마크 삭제 성공:", contentId);
      } else {
        toast.success("북마크에 추가되었습니다.");
        console.log("[BookmarkButton] 북마크 추가 성공:", contentId);
      }
    } catch (error) {
      console.error("[BookmarkButton] 북마크 토글 실패:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "북마크 처리 중 오류가 발생했습니다.",
      );
    }
  };

  // 로그인하지 않은 경우 로그인 유도 버튼
  if (!isAuthenticated) {
    return (
      <SignInButton mode="modal">
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          aria-label="북마크 추가 (로그인 필요)"
        >
          <Star className="size-4" />
          북마크
        </Button>
      </SignInButton>
    );
  }

  // 로딩 중 또는 에러 발생 시
  if (isLoading || error) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={cn("gap-2", className)}
        aria-label="북마크 로딩 중"
      >
        <Star className="size-4" />
        북마크
      </Button>
    );
  }

  // 북마크 버튼
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isMutating}
      className={cn("gap-2", className)}
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
    >
      <Star
        className={cn(
          "size-4",
          isBookmarked && "fill-yellow-400 text-yellow-400",
        )}
      />
      {isMutating ? "처리 중..." : isBookmarked ? "북마크됨" : "북마크"}
    </Button>
  );
}

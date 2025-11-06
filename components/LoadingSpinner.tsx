"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file LoadingSpinner.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중임을 사용자에게 표시하는 스피너 컴포넌트입니다.
 *
 * 사용 방법:
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" />
 * <LoadingSpinner text="로딩 중..." />
 * ```
 *
 * @see {@link /docs/prd.md#75-로딩-상태} - PRD 문서의 로딩 상태 섹션
 */

interface LoadingSpinnerProps {
  /** 스피너 크기 (기본값: "md") */
  size?: "sm" | "md" | "lg";
  /** 로딩 텍스트 (선택 사항) */
  text?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 전체 화면 오버레이 (기본값: false) */
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function LoadingSpinner({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  return spinner;
}

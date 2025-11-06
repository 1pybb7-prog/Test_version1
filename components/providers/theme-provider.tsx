"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Theme Provider 컴포넌트
 *
 * 다크모드 지원을 위한 next-themes Provider입니다.
 *
 * @see {@link /docs/prd.md#31-frontend} - PRD 문서의 기술 스택 섹션
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

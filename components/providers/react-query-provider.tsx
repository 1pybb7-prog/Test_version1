"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Provider 컴포넌트
 *
 * 서버 상태 관리를 위한 React Query를 설정합니다.
 *
 * @see {@link /docs/prd.md#31-frontend} - PRD 문서의 기술 스택 섹션
 */
export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // QueryClient를 useState로 생성하여 각 렌더링마다 새로 생성되지 않도록 합니다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 staleTime: 1분 (60초)
            staleTime: 60 * 1000,
            // 기본 gcTime (이전 cacheTime): 5분
            gcTime: 5 * 60 * 1000,
            // 네트워크 에러 시 자동 재시도
            retry: 1,
            // refetchOnWindowFocus 비활성화 (선택 사항)
            refetchOnWindowFocus: false,
            // 에러가 발생해도 쿼리가 실패 상태로 남지 않도록 처리
            throwOnError: false,
          },
          mutations: {
            // 에러가 발생해도 mutation이 실패 상태로 남지 않도록 처리
            throwOnError: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

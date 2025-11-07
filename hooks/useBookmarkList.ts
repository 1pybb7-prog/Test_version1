"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { getBookmarks } from "@/lib/api/supabase-api";

/**
 * @file useBookmarkList.ts
 * @description 북마크 목록 조회 훅
 *
 * React Query를 사용하여 북마크 목록을 조회하는 훅입니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 조회 (useQuery)
 * 2. 북마크 ID 목록 반환
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 * @see {@link /lib/api/supabase-api.ts} - 북마크 API 함수들
 */

/**
 * 북마크 목록 조회 훅
 *
 * @returns 북마크 목록 및 상태
 */
export function useBookmarkList() {
  const { userId, isLoaded } = useAuth();
  const supabase = useClerkSupabaseClient();

  // 북마크 목록 조회 (useQuery)
  const {
    data: bookmarks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookmarks", userId],
    queryFn: async () => {
      if (!userId || !isLoaded) {
        return [];
      }

      console.log("[useBookmarkList] 북마크 목록 조회:", { userId });
      const bookmarkList = await getBookmarks(supabase, userId);
      console.log(
        "[useBookmarkList] 북마크 목록 조회 완료:",
        bookmarkList.length,
      );
      return bookmarkList;
    },
    enabled: Boolean(userId && isLoaded),
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });

  // 북마크된 콘텐츠 ID 목록
  const bookmarkedContentIds = bookmarks
    ? new Set(bookmarks.map((bookmark) => bookmark.content_id))
    : new Set<string>();

  return {
    bookmarks: bookmarks ?? [],
    bookmarkedContentIds,
    isLoading,
    error,
    refetch,
    isAuthenticated: Boolean(userId && isLoaded),
  };
}

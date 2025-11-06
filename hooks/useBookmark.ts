"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import {
  addBookmark,
  removeBookmark,
  isBookmarked,
} from "@/lib/api/supabase-api";

/**
 * @file useBookmark.ts
 * @description 북마크 로직 훅
 *
 * React Query를 사용하여 북마크 기능을 제공하는 훅입니다.
 *
 * 주요 기능:
 * 1. 북마크 여부 확인 (useQuery)
 * 2. 북마크 추가/삭제 (useMutation)
 * 3. 북마크 토글 기능
 *
 * @see {@link /docs/prd.md#261-북마크-추가-기능} - PRD 문서의 북마크 섹션
 * @see {@link /lib/api/supabase-api.ts} - 북마크 API 함수들
 */

/**
 * 북마크 로직 훅
 *
 * @param contentId - 콘텐츠 ID
 * @returns 북마크 상태 및 함수들
 */
export function useBookmark(contentId: string) {
  const { userId, isLoaded } = useAuth();
  const supabase = useClerkSupabaseClient();
  const queryClient = useQueryClient();

  // 북마크 여부 확인 (useQuery)
  const {
    data: isBookmarkedValue,
    isLoading: isLoadingBookmark,
    error: bookmarkError,
  } = useQuery({
    queryKey: ["bookmarks", contentId, userId],
    queryFn: async (): Promise<boolean> => {
      if (!userId || !isLoaded) {
        return false;
      }

      console.log("[useBookmark] 북마크 여부 확인:", { userId, contentId });
      return await isBookmarked(supabase, userId, contentId);
    },
    enabled: Boolean(userId && isLoaded && contentId),
    staleTime: 30 * 1000, // 30초
    gcTime: 5 * 60 * 1000, // 5분
  });

  // 북마크 추가 (useMutation)
  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }

      console.log("[useBookmark] 북마크 추가 시작:", { userId, contentId });
      const bookmark = await addBookmark(supabase, {
        user_id: userId,
        content_id: contentId,
      });
      console.log("[useBookmark] 북마크 추가 완료:", bookmark);
      return bookmark;
    },
    onSuccess: () => {
      // 북마크 여부 쿼리 무효화 및 재조회
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", contentId, userId],
      });
      // 북마크 목록 쿼리도 무효화 (목록 페이지에서 사용 시)
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", userId],
      });
      console.log("[useBookmark] 북마크 추가 성공 - 쿼리 무효화 완료");
    },
    onError: (error) => {
      console.error("[useBookmark] 북마크 추가 실패:", error);
    },
  });

  // 북마크 삭제 (useMutation)
  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("로그인이 필요합니다.");
      }

      console.log("[useBookmark] 북마크 삭제 시작:", { userId, contentId });
      await removeBookmark(supabase, {
        user_id: userId,
        content_id: contentId,
      });
      console.log("[useBookmark] 북마크 삭제 완료");
    },
    onSuccess: () => {
      // 북마크 여부 쿼리 무효화 및 재조회
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", contentId, userId],
      });
      // 북마크 목록 쿼리도 무효화 (목록 페이지에서 사용 시)
      queryClient.invalidateQueries({
        queryKey: ["bookmarks", userId],
      });
      console.log("[useBookmark] 북마크 삭제 성공 - 쿼리 무효화 완료");
    },
    onError: (error) => {
      console.error("[useBookmark] 북마크 삭제 실패:", error);
    },
  });

  // 북마크 토글 함수
  const toggleBookmark = async () => {
    if (!userId || !isLoaded) {
      throw new Error("로그인이 필요합니다.");
    }

    if (isBookmarkedValue) {
      await removeBookmarkMutation.mutateAsync();
    } else {
      await addBookmarkMutation.mutateAsync();
    }
  };

  return {
    // 상태
    isBookmarked: isBookmarkedValue ?? false,
    isLoading: isLoadingBookmark,
    isMutating:
      addBookmarkMutation.isPending || removeBookmarkMutation.isPending,
    error:
      bookmarkError ||
      addBookmarkMutation.error ||
      removeBookmarkMutation.error,
    // 인증 상태
    isAuthenticated: Boolean(userId && isLoaded),
    // 함수
    addBookmark: addBookmarkMutation.mutateAsync,
    removeBookmark: removeBookmarkMutation.mutateAsync,
    toggleBookmark,
  };
}

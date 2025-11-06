/**
 * @file supabase-api.ts
 * @description Supabase 쿼리 함수들 (북마크)
 *
 * 북마크 기능을 위한 Supabase 데이터베이스 쿼리 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크 추가
 * 2. 북마크 삭제
 * 3. 북마크 목록 조회
 * 4. 북마크 여부 확인
 *
 * 주의사항:
 * - 서버 사이드에서는 `createClerkSupabaseClient()` 사용
 * - 클라이언트 사이드에서는 `useClerkSupabaseClient()` 훅 사용
 *
 * @see {@link /lib/types/bookmark.ts} - 북마크 타입 정의
 * @see {@link /supabase/migrations/mytour.sql} - 데이터베이스 스키마
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Bookmark,
  CreateBookmarkInput,
  DeleteBookmarkInput,
} from "@/lib/types/bookmark";

/**
 * 북마크 추가
 *
 * @param supabase - Supabase 클라이언트
 * @param input - 북마크 생성 입력 데이터
 * @returns 생성된 북마크
 */
export async function addBookmark(
  supabase: SupabaseClient,
  input: CreateBookmarkInput,
): Promise<Bookmark> {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: input.user_id,
      content_id: input.content_id,
    })
    .select()
    .single();

  if (error) {
    // 중복 북마크인 경우 에러 처리
    if (error.code === "23505") {
      throw new Error("이미 북마크한 관광지입니다.");
    }
    console.error("[Supabase API] 북마크 추가 에러:", error);
    throw new Error(`북마크 추가 실패: ${error.message}`);
  }

  return data;
}

/**
 * 북마크 삭제
 *
 * @param supabase - Supabase 클라이언트
 * @param input - 북마크 삭제 입력 데이터
 * @returns 삭제 성공 여부
 */
export async function removeBookmark(
  supabase: SupabaseClient,
  input: DeleteBookmarkInput,
): Promise<boolean> {
  let query = supabase.from("bookmarks").delete();

  // ID로 삭제
  if (input.id) {
    query = query.eq("id", input.id);
  }
  // 사용자 ID + 콘텐츠 ID로 삭제
  else if (input.user_id && input.content_id) {
    query = query
      .eq("user_id", input.user_id)
      .eq("content_id", input.content_id);
  } else {
    throw new Error(
      "북마크 삭제를 위해 id 또는 (user_id, content_id)가 필요합니다.",
    );
  }

  const { error } = await query;

  if (error) {
    console.error("[Supabase API] 북마크 삭제 에러:", error);
    throw new Error(`북마크 삭제 실패: ${error.message}`);
  }

  return true;
}

/**
 * 북마크 목록 조회
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @returns 북마크 목록
 */
export async function getBookmarks(
  supabase: SupabaseClient,
  userId: string,
): Promise<Bookmark[]> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase API] 북마크 목록 조회 에러:", error);
    throw new Error(`북마크 목록 조회 실패: ${error.message}`);
  }

  return data ?? [];
}

/**
 * 북마크 여부 확인
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @param contentId - 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function isBookmarked(
  supabase: SupabaseClient,
  userId: string,
  contentId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase API] 북마크 확인 에러:", error);
    throw new Error(`북마크 확인 실패: ${error.message}`);
  }

  return data !== null;
}

/**
 * 특정 콘텐츠 ID 목록의 북마크 여부 확인
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID
 * @param contentIds - 콘텐츠 ID 목록
 * @returns 콘텐츠 ID별 북마크 여부 맵
 */
export async function getBookmarkStatus(
  supabase: SupabaseClient,
  userId: string,
  contentIds: string[],
): Promise<Record<string, boolean>> {
  if (contentIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("content_id")
    .eq("user_id", userId)
    .in("content_id", contentIds);

  if (error) {
    console.error("[Supabase API] 북마크 상태 조회 에러:", error);
    throw new Error(`북마크 상태 조회 실패: ${error.message}`);
  }

  const bookmarkedIds = new Set((data ?? []).map((item) => item.content_id));

  return Object.fromEntries(
    contentIds.map((id) => [id, bookmarkedIds.has(id)]),
  );
}

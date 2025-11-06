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
 * Clerk userId를 Supabase users 테이블의 UUID로 변환
 *
 * @param supabase - Supabase 클라이언트
 * @param clerkUserId - Clerk User ID (예: "user_2abc...")
 * @returns Supabase users 테이블의 UUID
 */
async function getSupabaseUserId(
  supabase: SupabaseClient,
  clerkUserId: string,
): Promise<string> {
  // Clerk userId가 UUID 형식인지 확인 (이미 Supabase users.id인 경우)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(clerkUserId)) {
    // 이미 UUID 형식이면 그대로 반환
    return clerkUserId;
  }

  // Clerk userId로 users 테이블에서 조회
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error) {
    console.error("[Supabase API] 사용자 조회 에러:", error);
    throw new Error(
      `사용자를 찾을 수 없습니다. 먼저 로그인하세요. (${error.message || "Unknown error"})`,
    );
  }

  if (!data) {
    throw new Error(
      "사용자를 찾을 수 없습니다. 먼저 로그인하세요.",
    );
  }

  return data.id;
}

/**
 * 북마크 추가
 *
 * @param supabase - Supabase 클라이언트
 * @param input - 북마크 생성 입력 데이터 (user_id는 Clerk userId 또는 Supabase UUID)
 * @returns 생성된 북마크
 */
export async function addBookmark(
  supabase: SupabaseClient,
  input: CreateBookmarkInput,
): Promise<Bookmark> {
  // Clerk userId를 Supabase UUID로 변환
  const supabaseUserId = await getSupabaseUserId(supabase, input.user_id);

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: supabaseUserId,
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
    throw new Error(
      `북마크 추가 실패: ${error.message || error.code || "Unknown error"}`,
    );
  }

  return data;
}

/**
 * 북마크 삭제
 *
 * @param supabase - Supabase 클라이언트
 * @param input - 북마크 삭제 입력 데이터 (user_id는 Clerk userId 또는 Supabase UUID)
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
    // Clerk userId를 Supabase UUID로 변환
    const supabaseUserId = await getSupabaseUserId(supabase, input.user_id);
    query = query
      .eq("user_id", supabaseUserId)
      .eq("content_id", input.content_id);
  } else {
    throw new Error(
      "북마크 삭제를 위해 id 또는 (user_id, content_id)가 필요합니다.",
    );
  }

  const { error } = await query;

  if (error) {
    console.error("[Supabase API] 북마크 삭제 에러:", error);
    throw new Error(
      `북마크 삭제 실패: ${error.message || error.code || "Unknown error"}`,
    );
  }

  return true;
}

/**
 * 북마크 목록 조회
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID (Clerk userId 또는 Supabase UUID)
 * @returns 북마크 목록
 */
export async function getBookmarks(
  supabase: SupabaseClient,
  userId: string,
): Promise<Bookmark[]> {
  // Clerk userId를 Supabase UUID로 변환
  const supabaseUserId = await getSupabaseUserId(supabase, userId);

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", supabaseUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase API] 북마크 목록 조회 에러:", error);
    throw new Error(
      `북마크 목록 조회 실패: ${error.message || error.code || "Unknown error"}`,
    );
  }

  return data ?? [];
}

/**
 * 북마크 여부 확인
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID (Clerk userId 또는 Supabase UUID)
 * @param contentId - 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function isBookmarked(
  supabase: SupabaseClient,
  userId: string,
  contentId: string,
): Promise<boolean> {
  // Clerk userId를 Supabase UUID로 변환
  const supabaseUserId = await getSupabaseUserId(supabase, userId);

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", supabaseUserId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase API] 북마크 확인 에러:", error);
    throw new Error(
      `북마크 확인 실패: ${error.message || error.code || "Unknown error"}`,
    );
  }

  return data !== null;
}

/**
 * 특정 콘텐츠 ID 목록의 북마크 여부 확인
 *
 * @param supabase - Supabase 클라이언트
 * @param userId - 사용자 ID (Clerk userId 또는 Supabase UUID)
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

  // Clerk userId를 Supabase UUID로 변환
  const supabaseUserId = await getSupabaseUserId(supabase, userId);

  const { data, error } = await supabase
    .from("bookmarks")
    .select("content_id")
    .eq("user_id", supabaseUserId)
    .in("content_id", contentIds);

  if (error) {
    console.error("[Supabase API] 북마크 상태 조회 에러:", error);
    throw new Error(
      `북마크 상태 조회 실패: ${error.message || error.code || "Unknown error"}`,
    );
  }

  const bookmarkedIds = new Set((data ?? []).map((item) => item.content_id));

  return Object.fromEntries(
    contentIds.map((id) => [id, bookmarkedIds.has(id)]),
  );
}

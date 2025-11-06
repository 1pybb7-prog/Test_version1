/**
 * @file bookmark.ts
 * @description 북마크 관련 타입 정의
 *
 * Supabase bookmarks 테이블의 데이터 구조를 기반으로 한 타입 정의입니다.
 *
 * 주요 타입:
 * 1. Bookmark - 북마크 데이터베이스 레코드
 * 2. BookmarkWithTour - 북마크와 관광지 정보를 함께 포함하는 타입 (JOIN 결과)
 *
 * @see {@link /supabase/migrations/mytour.sql} - 데이터베이스 스키마
 */

/**
 * 북마크 데이터베이스 레코드 타입
 *
 * Supabase bookmarks 테이블의 구조와 일치합니다.
 */
export interface Bookmark {
  /** 북마크 고유 ID (UUID) */
  id: string;
  /** 사용자 ID (users 테이블 참조) */
  user_id: string;
  /** 관광지 콘텐츠 ID (한국관광공사 API의 contentid) */
  content_id: string;
  /** 북마크 생성일시 */
  created_at: string;
}

/**
 * 북마크 생성 시 사용하는 타입
 *
 * id와 created_at은 데이터베이스에서 자동 생성됩니다.
 */
export interface CreateBookmarkInput {
  /** 사용자 ID */
  user_id: string;
  /** 관광지 콘텐츠 ID */
  content_id: string;
}

/**
 * 북마크 삭제 시 사용하는 타입
 */
export interface DeleteBookmarkInput {
  /** 북마크 ID 또는 사용자 ID + 콘텐츠 ID 조합 */
  id?: string;
  user_id?: string;
  content_id?: string;
}

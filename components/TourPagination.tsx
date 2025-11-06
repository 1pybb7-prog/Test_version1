"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

/**
 * @file TourPagination.tsx
 * @description 관광지 목록 페이지네이션 컴포넌트
 *
 * 관광지 목록의 페이지네이션을 제공하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이전/다음 페이지 네비게이션
 * 2. 페이지 번호 선택
 * 3. 총 페이지 수 표시 (선택 사항)
 * 4. 마지막 페이지 감지 및 비활성화
 *
 * @see {@link /docs/prd.md#21-관광지-목록--지역타입-필터} - PRD 문서의 페이지네이션 섹션
 * @see {@link /docs/reference/design/Design.md#1-홈페이지} - 디자인 문서의 페이지네이션 레이아웃
 */

interface TourPaginationProps {
  /** 현재 페이지 번호 (1부터 시작) */
  currentPage: number;
  /** 총 페이지 수 (없으면 추정값 사용) */
  totalPages?: number;
  /** 페이지당 항목 수 */
  itemsPerPage: number;
  /** 현재 페이지의 항목 수 */
  currentItemsCount: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 클래스명 */
  className?: string;
}

/**
 * 표시할 페이지 번호 계산
 *
 * @param currentPage - 현재 페이지
 * @param totalPages - 총 페이지 수
 * @returns 표시할 페이지 번호 배열
 */
function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const maxVisible = 5; // 최대 표시할 페이지 수
  const pages: number[] = [];

  if (totalPages <= maxVisible) {
    // 총 페이지 수가 적으면 모두 표시
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 현재 페이지를 중심으로 표시
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // 끝에 도달했을 때 조정
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
}

export default function TourPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  currentItemsCount,
  onPageChange,
  className,
}: TourPaginationProps) {
  // 총 페이지 수 계산 (없으면 추정값 사용)
  const estimatedTotalPages = totalPages ?? Math.ceil(currentPage * 1.5);
  const finalTotalPages = totalPages ?? estimatedTotalPages;

  // 마지막 페이지 여부 확인 (현재 항목 수가 itemsPerPage보다 적으면 마지막 페이지)
  const isLastPage = currentItemsCount < itemsPerPage;

  // 표시할 페이지 번호 계산
  const visiblePages = getVisiblePages(currentPage, finalTotalPages);

  /**
   * 페이지 변경 핸들러
   */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > finalTotalPages) {
      return;
    }
    onPageChange(page);
    console.log("[TourPagination] 페이지 변경:", page);
  };

  // 페이지가 1개 이하면 표시하지 않음
  if (finalTotalPages <= 1) {
    return null;
  }

  return (
    <Pagination className={cn("py-6", className)}>
      <PaginationContent>
        {/* 이전 페이지 버튼 */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-disabled={currentPage <= 1}
          />
        </PaginationItem>

        {/* 첫 페이지 */}
        {visiblePages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(1);
                }}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
            {visiblePages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {/* 페이지 번호 */}
        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page);
              }}
              isActive={page === currentPage}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* 마지막 페이지 */}
        {visiblePages[visiblePages.length - 1] < finalTotalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < finalTotalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(finalTotalPages);
                }}
                className="cursor-pointer"
              >
                {finalTotalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={
              isLastPage || currentPage >= finalTotalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            aria-disabled={isLastPage || currentPage >= finalTotalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

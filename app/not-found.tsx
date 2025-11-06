import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, MapPin } from "lucide-react";

/**
 * @file not-found.tsx
 * @description 404 페이지 컴포넌트
 *
 * 존재하지 않는 페이지에 접근했을 때 표시되는 404 페이지입니다.
 *
 * @see {@link /docs/prd.md#76-에러-처리} - PRD 문서의 에러 처리 섹션
 */

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-6">
        {/* 404 텍스트 */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
          <p className="max-w-md text-center text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            아래 링크를 통해 원하시는 페이지로 이동해주세요.
          </p>
        </div>

        {/* 주요 링크 */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button variant="default" className="gap-2">
              <Home className="size-4" />
              홈으로 가기
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Search className="size-4" />
              관광지 검색
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <MapPin className="size-4" />
              지도 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

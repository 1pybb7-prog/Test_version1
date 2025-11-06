import type { Metadata } from "next";
import { getTourDetail } from "@/actions/get-tour-detail";
import TourDetailPageClient from "./TourDetailPageClient";

/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시 (이름, 이미지, 주소, 전화번호, 홈페이지, 개요)
 * 2. SEO 최적화 (generateMetadata)
 * 3. 뒤로가기 버튼
 *
 * @see {@link /docs/prd.md#24-상세페이지} - PRD 문서의 상세페이지 섹션
 * @see {@link /docs/reference/design/Design.md#3-상세페이지} - 디자인 문서의 상세페이지
 */

interface PageProps {
  params: Promise<{ contentId: string }>;
}

/**
 * 메타데이터 생성 (SEO 최적화)
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { contentId } = await params;

  try {
    const detail = await getTourDetail(contentId);

    if (!detail) {
      return {
        title: "관광지 정보 없음 - My Trip",
        description: "요청하신 관광지 정보를 찾을 수 없습니다.",
      };
    }

    const description = detail.overview
      ? detail.overview.slice(0, 100).replace(/\n/g, " ")
      : `${detail.title}의 상세 정보를 확인하세요.`;
    const imageUrl = detail.firstimage || detail.firstimage2;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
    const pageUrl = `${siteUrl}/places/${contentId}`;

    return {
      title: `${detail.title} - My Trip`,
      description,
      openGraph: {
        title: detail.title,
        description,
        images: imageUrl ? [imageUrl] : [],
        url: pageUrl,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: detail.title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (error) {
    console.error("[generateMetadata] 에러:", error);
    return {
      title: "관광지 상세정보 - My Trip",
      description: "관광지 상세 정보를 확인하세요.",
    };
  }
}

/**
 * 상세페이지 메인 컴포넌트
 */
export default async function TourDetailPage({ params }: PageProps) {
  const { contentId } = await params;

  return <TourDetailPageClient contentId={contentId} />;
}

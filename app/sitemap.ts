import { MetadataRoute } from "next";

/**
 * @file sitemap.ts
 * @description sitemap.xml 생성
 *
 * 검색 엔진에 웹사이트의 페이지 구조를 알려주는 사이트맵을 생성합니다.
 *
 * @see {@link /docs/prd.md#923-seo-최적화} - PRD 문서의 SEO 최적화 섹션
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  // 정적 페이지 목록
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bookmarks`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 동적 페이지는 향후 관광지 상세페이지가 추가되면 구현
  // 예: /places/[contentId] 페이지들

  return staticPages;
}

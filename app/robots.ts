import { MetadataRoute } from "next";

/**
 * @file robots.ts
 * @description robots.txt 생성
 *
 * 검색 엔진 크롤러에게 웹사이트의 크롤링 규칙을 알려줍니다.
 *
 * @see {@link /docs/prd.md#923-seo-최적화} - PRD 문서의 SEO 최적화 섹션
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth-test/",
          "/storage-test/",
          "/_next/",
          "/admin/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

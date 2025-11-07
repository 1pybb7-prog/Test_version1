"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RegionStats } from "@/lib/types/stats";
import { cn } from "@/lib/utils";

/**
 * @file RegionChart.tsx
 * @description 지역별 분포 차트 컴포넌트
 *
 * 지역별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 Bar Chart 표시
 * 2. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 3. 호버 시 정확한 개수 표시
 * 4. 다크/라이트 모드 지원
 * 5. 반응형 디자인
 * 6. 로딩 상태
 * 7. 접근성 (ARIA 라벨, 키보드 네비게이션)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

interface RegionChartProps {
  /** 지역별 통계 데이터 */
  data?: RegionStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 차트 설정
 */
const chartConfig: ChartConfig = {
  count: {
    label: "관광지 개수",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * 지역별 분포 차트 스켈레톤
 */
function RegionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * 지역별 분포 차트 컴포넌트
 */
export default function RegionChart({
  data,
  isLoading = false,
  className,
}: RegionChartProps) {
  const router = useRouter();

  console.log("[RegionChart] 렌더링:", { isLoading, dataCount: data?.length });

  // 로딩 상태
  if (isLoading || !data) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <RegionChartSkeleton />
      </div>
    );
  }

  // 데이터가 없을 때
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>지역별 분포</CardTitle>
          <CardDescription>지역별 관광지 개수를 확인하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 차트 데이터 준비 (상위 10개 지역만 표시)
  const chartData = data.slice(0, 10).map((region) => ({
    name: region.name,
    count: region.count,
    areacode: region.areacode,
  }));

  /**
   * 바 클릭 핸들러
   * 해당 지역의 관광지 목록 페이지로 이동
   */
  const handleBarClick = (data: { areacode: string; name: string }) => {
    console.log("[RegionChart] 바 클릭:", data);
    // 홈페이지로 이동하고 지역 필터 적용
    router.push(`/?areaCode=${data.areacode}`);
  };

  /**
   * 툴팁 포맷터
   * 호버 시 정확한 개수 표시
   */
  const tooltipFormatter = (value: number) => {
    return [`${value.toLocaleString("ko-KR")}개`, "관광지 개수"];
  };

  /**
   * 라벨 포맷터
   * X축 라벨 포맷팅
   */
  const labelFormatter = (label: string) => {
    return label;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>지역별 분포</CardTitle>
          <CardDescription>
            지역별 관광지 개수를 확인하세요 (상위 10개 지역)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
              accessibilityLayer
              role="img"
              aria-label="지역별 관광지 개수 분포 차트"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => value.toLocaleString("ko-KR")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={tooltipFormatter}
                    labelFormatter={labelFormatter}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                onClick={(data) => {
                  const regionData = chartData.find(
                    (item) => item.name === data.name,
                  );
                  if (regionData) {
                    handleBarClick({
                      areacode: regionData.areacode,
                      name: regionData.name,
                    });
                  }
                }}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label="지역별 관광지 개수 바"
              />
            </BarChart>
          </ChartContainer>

          {/* 접근성을 위한 테이블 (스크린 리더용) */}
          <div className="sr-only">
            <table>
              <caption>지역별 관광지 개수</caption>
              <thead>
                <tr>
                  <th>지역</th>
                  <th>관광지 개수</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.areacode}>
                    <td>{item.name}</td>
                    <td>{item.count.toLocaleString("ko-KR")}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

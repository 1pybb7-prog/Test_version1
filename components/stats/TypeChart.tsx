"use client";

import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
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
import type { TypeStats } from "@/lib/types/stats";
import { cn } from "@/lib/utils";

/**
 * @file TypeChart.tsx
 * @description 타입별 분포 차트 컴포넌트
 *
 * 관광 타입별 관광지 개수를 Donut Chart로 시각화하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 타입별 관광지 개수 Donut Chart 표시
 * 2. 타입별 비율 및 개수 표시
 * 3. 섹션 클릭 시 해당 타입 목록 페이지로 이동
 * 4. 호버 시 타입명, 개수, 비율 표시
 * 5. 다크/라이트 모드 지원
 * 6. 반응형 디자인
 * 7. 로딩 상태
 * 8. 접근성 (ARIA 라벨)
 *
 * @see {@link /docs/TODO.md#phase-4-통계-대시보드-페이지-stats} - TODO 문서의 통계 대시보드 섹션
 */

interface TypeChartProps {
  /** 타입별 통계 데이터 */
  data?: TypeStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 차트 색상 설정
 */
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

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
 * 타입별 분포 차트 스켈레톤
 */
function TypeChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

/**
 * 타입별 분포 차트 컴포넌트
 */
export default function TypeChart({
  data,
  isLoading = false,
  className,
}: TypeChartProps) {
  const router = useRouter();

  console.log("[TypeChart] 렌더링:", { isLoading, dataCount: data?.length });

  // 로딩 상태
  if (isLoading || !data) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <TypeChartSkeleton />
      </div>
    );
  }

  // 데이터가 없을 때
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>타입별 분포</CardTitle>
          <CardDescription>
            관광 타입별 관광지 개수를 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체 개수 계산
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  // 차트 데이터 준비 (비율 포함)
  const chartData = data.map((type, index) => ({
    name: type.name,
    count: type.count,
    contenttypeid: type.contenttypeid,
    percentage: totalCount > 0 ? (type.count / totalCount) * 100 : 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  /**
   * 섹션 클릭 핸들러
   * 해당 타입의 관광지 목록 페이지로 이동
   */
  const handlePieClick = (data: { contenttypeid: string; name: string }) => {
    console.log("[TypeChart] 섹션 클릭:", data);
    // 홈페이지로 이동하고 타입 필터 적용
    router.push(`/?contentTypeId=${data.contenttypeid}`);
  };

  /**
   * 툴팁 포맷터
   * 호버 시 타입명, 개수, 비율 표시
   */
  const tooltipFormatter = (value: number, name: string, props: any) => {
    const percentage = props.payload.percentage;
    return [
      `${value.toLocaleString("ko-KR")}개 (${percentage.toFixed(1)}%)`,
      name,
    ];
  };

  /**
   * 라벨 포맷터
   * 차트에 표시할 라벨 포맷팅
   */
  const labelFormatter = (label: string) => {
    return label;
  };

  /**
   * 커스텀 라벨 렌더러
   * Donut Chart 중앙에 총 개수 표시
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // 라벨이 너무 작으면 표시하지 않음
    if (percent < 0.05) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>타입별 분포</CardTitle>
          <CardDescription>
            관광 타입별 관광지 개수와 비율을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="count"
                  onClick={(data) => {
                    handlePieClick({
                      contenttypeid: data.contenttypeid,
                      name: data.name,
                    });
                  }}
                  style={{ cursor: "pointer" }}
                  role="button"
                  aria-label="타입별 관광지 개수 도넛 차트"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={tooltipFormatter}
                      labelFormatter={labelFormatter}
                    />
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => {
                    const data = chartData.find((item) => item.name === value);
                    if (data) {
                      return `${value} (${data.count.toLocaleString(
                        "ko-KR",
                      )}개)`;
                    }
                    return value;
                  }}
                />
              </PieChart>
            </ChartContainer>

            {/* 중앙 총 개수 표시 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl font-bold">
                {totalCount.toLocaleString("ko-KR")}
              </p>
              <p className="text-xs text-muted-foreground">전체 관광지</p>
            </div>
          </div>

          {/* 접근성을 위한 테이블 (스크린 리더용) */}
          <div className="sr-only">
            <table>
              <caption>타입별 관광지 개수 및 비율</caption>
              <thead>
                <tr>
                  <th>타입</th>
                  <th>개수</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item) => (
                  <tr key={item.contenttypeid}>
                    <td>{item.name}</td>
                    <td>{item.count.toLocaleString("ko-KR")}개</td>
                    <td>{item.percentage.toFixed(1)}%</td>
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

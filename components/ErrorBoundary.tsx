"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * @file ErrorBoundary.tsx
 * @description 에러 바운더리 컴포넌트
 *
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하고 사용자에게 친화적인 에러 메시지를 표시합니다.
 *
 * 사용 방법:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @see {@link /docs/prd.md#76-에러-처리} - PRD 문서의 에러 처리 섹션
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 (향후 에러 리포팅 서비스 연동 가능)
    console.error("[ErrorBoundary] 에러 발생:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-8 text-destructive" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-xl font-semibold">오류가 발생했습니다</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                {this.state.error?.message ||
                  "예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={this.handleReset} variant="outline">
                <RefreshCw className="mr-2 size-4" />
                다시 시도
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                페이지 새로고침
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

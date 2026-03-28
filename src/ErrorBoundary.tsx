import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center p-4 bg-neutral-50">
          <Card className="w-full max-w-md border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">오류가 발생했습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                앱 실행 중 문제가 발생했습니다. 페이지를 새로고침하거나 다시 로그인해 주세요.
              </p>
              <div className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs font-mono break-words">
                {this.state.error?.message}
              </div>
              <Button onClick={() => window.location.reload()} className="w-full">
                새로고침
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

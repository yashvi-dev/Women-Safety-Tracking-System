'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <h2 className="text-lg font-semibold">Something went wrong!</h2>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
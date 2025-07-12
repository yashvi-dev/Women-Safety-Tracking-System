import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="flex items-center gap-2 text-purple-600">
        <FileQuestion className="h-8 w-8" />
        <h2 className="text-xl font-semibold">Page Not Found</h2>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/dashboard">
          Return to Dashboard
        </Link>
      </Button>
    </div>
  );
}
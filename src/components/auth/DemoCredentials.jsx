import React from 'react';
import { cn } from '@/lib/utils';

export function DemoCredentials({ className, ...props }) {
  return (
    <div className={cn('mt-6 rounded-lg border bg-muted p-4', className)} {...props}>
      <p className="text-sm font-medium text-muted-foreground">Demo Credentials:</p>
      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <p>
          <strong>Admin:</strong> admin@community.com / admin123
        </p>
        <p>
          <strong>User:</strong> john@community.com / user123
        </p>
      </div>
    </div>
  );
}
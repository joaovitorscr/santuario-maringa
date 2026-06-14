import React from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

type SurfaceProps = ViewProps & {
  className?: string;
  tone?: 'default' | 'accentSoft';
};

export function Surface({ className, tone = 'default', ...props }: SurfaceProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark',
        tone === 'accentSoft' && 'bg-app-accent-soft dark:bg-app-accent-soft-dark',
        className,
      )}
      {...props}
    />
  );
}

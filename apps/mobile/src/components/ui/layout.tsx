import React from 'react';
import { View, type ViewProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { cn } from '@/lib/cn';

type HeaderBlockProps = ViewProps & {
  title: string;
  subtitle?: string;
  className?: string;
};

export function HeaderBlock({ title, subtitle, className, ...props }: HeaderBlockProps) {
  return (
    <View className={cn('gap-0.5', className)} {...props}>
      <AppText variant="subtitle">{title}</AppText>
      {subtitle ? <AppText tone="muted">{subtitle}</AppText> : null}
    </View>
  );
}

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <AppText variant="label" className={className}>
      {children}
    </AppText>
  );
}

import React from 'react';
import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

type AppTextProps = TextProps & {
  variant?: 'default' | 'title' | 'subtitle' | 'small' | 'smallBold' | 'label' | 'link' | 'code';
  tone?: 'default' | 'muted' | 'accent' | 'danger';
  className?: string;
};

const variantClasses: Record<NonNullable<AppTextProps['variant']>, string> = {
  default:
    'font-sans text-base font-medium leading-6 text-app-text dark:text-app-text-dark',
  title:
    'font-sans text-5xl font-bold leading-[54px] text-app-text dark:text-app-text-dark',
  subtitle:
    'font-sans text-[28px] font-semibold leading-[34px] text-app-text dark:text-app-text-dark',
  small:
    'font-sans text-sm font-medium leading-5 text-app-text dark:text-app-text-dark',
  smallBold:
    'font-sans text-sm font-bold leading-5 text-app-text dark:text-app-text-dark',
  label:
    'font-sans text-sm font-bold uppercase tracking-[0.7px] leading-5 text-app-muted dark:text-app-muted-dark',
  link: 'font-sans text-base font-semibold leading-6 text-app-accent dark:text-app-accent-dark',
  code: 'font-mono text-xs font-medium text-app-text dark:text-app-text-dark',
};

const toneClasses: Record<NonNullable<AppTextProps['tone']>, string> = {
  default: '',
  muted: 'text-app-muted dark:text-app-muted-dark',
  accent: 'text-app-accent dark:text-app-accent-dark',
  danger: 'text-app-danger',
};

export function AppText({
  variant = 'default',
  tone = 'default',
  className,
  ...props
}: AppTextProps) {
  return <Text className={cn(variantClasses[variant], toneClasses[tone], className)} {...props} />;
}

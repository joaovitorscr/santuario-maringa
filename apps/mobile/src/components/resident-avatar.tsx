import React from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { cn } from '@/lib/cn';

type ResidentAvatarProps = {
  name: string;
  size?: 'default' | 'hero';
};

export function ResidentAvatar({ name, size = 'default' }: ResidentAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View
      className={cn(
        'items-center justify-center rounded-full bg-app-accent-soft dark:bg-app-accent-soft-dark',
        size === 'hero' ? 'h-[116px] w-[116px]' : 'h-[52px] w-[52px]',
      )}>
      <AppText
        className={cn(
          'font-extrabold text-app-accent dark:text-app-accent-dark',
          size === 'hero' ? 'text-[40px] leading-[44px]' : 'text-lg leading-6',
        )}>
        {initial}
      </AppText>
    </View>
  );
}

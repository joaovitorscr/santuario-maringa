import React from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { ResidentStatus } from '@/data/residents';
import { cn } from '@/lib/cn';

type StatusChipProps = {
  status: ResidentStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  const toneClass =
    status === 'Disponível'
      ? 'bg-app-accent-soft dark:bg-app-accent-soft-dark text-app-accent dark:text-app-accent-dark'
      : status === 'Indisponível'
        ? 'bg-app-warning-soft dark:bg-app-warning-soft-dark text-app-warning-text dark:text-app-warning-text-dark'
        : status === 'Adotado'
          ? 'bg-app-success-soft dark:bg-app-success-soft-dark text-app-success-text dark:text-app-success-text-dark'
          : 'bg-app-accent-soft dark:bg-app-accent-soft-dark text-app-accent dark:text-app-accent-dark';

  return (
    <View className={cn('self-start rounded-lg px-2.5 py-[5px]', toneClass)}>
      <AppText variant="smallBold" className="text-[11px] leading-[14px]">
        {status}
      </AppText>
    </View>
  );
}

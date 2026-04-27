import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { ResidentAvatar } from '@/components/resident-avatar';
import { StatusChip } from '@/components/status-chip';
import { AppText } from '@/components/ui/app-text';
import { AppIcon } from '@/components/ui/icon';
import { cn } from '@/lib/cn';
import { ResidentStatus } from '@/data/residents';

type ResidentListItemProps = {
  id: string;
  name: string;
  meta: string;
  detail?: string;
  status: ResidentStatus;
  showChevron?: boolean;
  className?: string;
  compact?: boolean;
};

export function ResidentListItem({
  id,
  name,
  meta,
  detail,
  status,
  showChevron = false,
  className,
  compact = false,
}: ResidentListItemProps) {
  return (
    <Link href={`/residente/${id}`} asChild>
      <Pressable className={cn('px-4', className)}>
        <View className={cn('flex-row items-center gap-3 py-3.5', compact ? 'py-4' : 'py-3.5')}>
          <ResidentAvatar name={name} />
          <View className="flex-1 gap-0.5">
            <AppText className="text-[17px] font-bold leading-[21px]">{name}</AppText>
            <AppText tone="muted" numberOfLines={1}>
              {meta}
            </AppText>
            {detail ? <AppText tone="muted">{detail}</AppText> : null}
          </View>
          <View className="items-end gap-1.5">
            <StatusChip status={status} />
            {showChevron ? <AppIcon icon={ArrowRight01Icon} size={28} /> : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

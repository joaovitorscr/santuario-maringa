import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react-native';
import React from 'react';

import { useTheme } from '@/hooks/use-theme';

type AppIconProps = {
  icon: IconSvgElement;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function AppIcon({ icon, size = 24, color, strokeWidth = 1.8 }: AppIconProps) {
  const theme = useTheme();

  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color ?? theme.text}
      strokeWidth={strokeWidth}
    />
  );
}

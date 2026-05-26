import { type IconSvgElement } from "@hugeicons/react-native";
import React from "react";
import { View } from "react-native";

import { AppIcon } from "@/components/ui/icon";
import { SectionLabel } from "@/components/ui/layout";
import { useTheme } from "@/hooks/use-theme";

type SectionHeaderProps = {
  icon: IconSvgElement;
  label: string;
};

export function SectionHeader({ icon, label }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center gap-2">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-app-accent-soft dark:bg-app-accent-soft-dark">
        <AppIcon icon={icon} size={18} color={theme.text} />
      </View>
      <SectionLabel>{label}</SectionLabel>
    </View>
  );
}

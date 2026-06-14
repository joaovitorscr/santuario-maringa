import { type IconSvgElement } from "@hugeicons/react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
} from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type IconButtonProps = PressableProps & {
  icon: IconSvgElement;
  tone?: "default" | "danger";
  size?: "default" | "compact";
  className?: string;
};

export function IconButton({
  icon,
  tone = "default",
  size = "default",
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      className={cn(
        "items-center justify-center",
        size === "compact" ? "min-h-10 min-w-10" : "min-h-[56px] min-w-[56px]",
        className,
      )}
      {...props}
    >
      <AppIcon
        icon={icon}
        size={size === "compact" ? 24 : 34}
        color={tone === "danger" ? "#E11D48" : undefined}
      />
    </Pressable>
  );
}

type PrimaryButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  className?: string;
};

export function PrimaryButton({
  label,
  loading = false,
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        "mt-1 min-h-[52px] flex-row items-center justify-center gap-2 rounded-lg bg-app-accent dark:bg-app-accent-dark",
        isDisabled && "opacity-70",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? <ActivityIndicator color="#1F2933" size="small" /> : null}
      <AppText className="text-lg font-bold leading-[22px] text-app-text">
        {label}
      </AppText>
    </Pressable>
  );
}

type HealthBadgeProps = {
  active: boolean;
  label: "Sim" | "Não";
};

export function HealthBadge({ active, label }: HealthBadgeProps) {
  return (
    <View
      className={cn(
        "min-w-[46px] items-center rounded-lg px-3 py-1.5",
        active
          ? "bg-app-success-soft dark:bg-app-success-soft-dark"
          : "bg-app-border dark:bg-app-border-dark",
      )}
    >
      <AppText
        className={cn(
          active
            ? "text-app-success-text dark:text-app-success-text-dark"
            : "text-app-muted dark:text-app-muted-dark",
        )}
      >
        {label}
      </AppText>
    </View>
  );
}

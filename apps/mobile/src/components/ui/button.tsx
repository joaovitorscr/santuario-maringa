import { type IconSvgElement } from "@hugeicons/react-native";
import React from "react";
import { Pressable, View, type PressableProps } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type IconButtonProps = PressableProps & {
  icon: IconSvgElement;
  tone?: "default" | "danger";
  className?: string;
};

export function IconButton({ icon, tone = "default", className, ...props }: IconButtonProps) {
  return (
    <Pressable
      className={cn("min-h-[56px] min-w-[56px] items-center justify-center", className)}
      {...props}
    >
      <AppIcon icon={icon} size={34} color={tone === "danger" ? "#E11D48" : undefined} />
    </Pressable>
  );
}

type PrimaryButtonProps = PressableProps & {
  label: string;
  className?: string;
};

export function PrimaryButton({ label, className, ...props }: PrimaryButtonProps) {
  return (
    <Pressable
      className={cn(
        "mt-1 min-h-[52px] items-center justify-center rounded-[10px] bg-app-accent dark:bg-app-accent-dark",
        className,
      )}
      {...props}
    >
      <AppText className="text-lg font-bold leading-[22px] text-white">{label}</AppText>
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

import React from "react";
import { Pressable, View, type PressableProps } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { cn } from "@/lib/cn";

type IconButtonProps = PressableProps & {
  icon: string;
  tone?: "default" | "danger";
  className?: string;
};

export function IconButton({ icon, tone = "default", className, ...props }: IconButtonProps) {
  return (
    <Pressable className={cn("min-h-7 min-w-7 items-center justify-center", className)} {...props}>
      <AppText className="text-[24px] leading-6" tone={tone === "danger" ? "danger" : "default"}>
        {icon}
      </AppText>
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

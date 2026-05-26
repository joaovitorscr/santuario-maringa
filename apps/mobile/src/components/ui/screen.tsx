import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

type ScreenScrollProps = React.ComponentProps<typeof ScrollView> & {
  className?: string;
  contentClassName?: string;
};

export function ScreenScroll({
  className,
  contentClassName,
  children,
  ...props
}: ScreenScrollProps) {
  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      className="mx-auto h-full w-full max-w-content flex-1 bg-app-background px-4 dark:bg-app-background-dark"
    >
      <ScrollView
        className={cn("flex-1", className)}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        <View className={cn("gap-4 pb-28 pt-3", contentClassName)}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

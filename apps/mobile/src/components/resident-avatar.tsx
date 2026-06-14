import React from "react";
import { Image, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { cn } from "@/lib/cn";

type ResidentAvatarProps = {
  name: string;
  pictureBase64?: string | null;
  size?: "default" | "hero";
};

function getPictureUri(pictureBase64?: string | null) {
  if (!pictureBase64) {
    return null;
  }

  return pictureBase64.startsWith("data:")
    ? pictureBase64
    : `data:image/jpeg;base64,${pictureBase64}`;
}

export function ResidentAvatar({
  name,
  pictureBase64,
  size = "default",
}: ResidentAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  const pictureUri = getPictureUri(pictureBase64);
  const dimensionClass =
    size === "hero" ? "h-[116px] w-[116px]" : "h-[52px] w-[52px]";

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-app-accent-soft dark:bg-app-accent-soft-dark",
        dimensionClass,
      )}
    >
      {pictureUri ? (
        <Image
          source={{ uri: pictureUri }}
          className={cn("h-full w-full", dimensionClass)}
        />
      ) : (
        <AppText
          className={cn(
            "font-extrabold text-app-accent dark:text-app-accent-dark",
            size === "hero"
              ? "text-[40px] leading-[44px]"
              : "text-lg leading-6",
          )}
        >
          {initial}
        </AppText>
      )}
    </View>
  );
}

import { Mail01Icon, UserIcon } from "@hugeicons/core-free-icons";
import React from "react";
import { Image, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { Surface } from "@/components/ui/surface";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";

function getUserInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

export default function ProfileScreen() {
  const colors = useTheme();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const userName = user?.name || user?.email || "Usuário";

  return (
    <ScreenScroll>
      <HeaderBlock title="Perfil" subtitle="Dados do usuário conectado" />

      <Surface className="items-center gap-3 p-5">
        <View
          className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
          style={{ backgroundColor: colors.accentSoft }}
        >
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              accessibilityIgnoresInvertColors
              className="h-full w-full"
            />
          ) : (
            <AppText className="text-[32px] font-extrabold leading-9 text-app-accent dark:text-app-accent-dark">
              {getUserInitials(userName)}
            </AppText>
          )}
        </View>

        <View className="items-center gap-1">
          <AppText className="text-xl font-extrabold leading-7" selectable>
            {userName}
          </AppText>
          {user?.email ? (
            <AppText tone="muted" selectable>
              {user.email}
            </AppText>
          ) : null}
        </View>
      </Surface>

      <Surface className="overflow-hidden">
        <View className="flex-row items-center gap-3 border-b border-app-border px-4 py-3.5 dark:border-app-border-dark">
          <AppIcon icon={UserIcon} size={20} color={colors.textSecondary} />
          <View className="min-w-0 flex-1">
            <AppText variant="label">Nome</AppText>
            <AppText selectable numberOfLines={1}>
              {userName}
            </AppText>
          </View>
        </View>

        {user?.email ? (
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <AppIcon icon={Mail01Icon} size={20} color={colors.textSecondary} />
            <View className="min-w-0 flex-1">
              <AppText variant="label">Email</AppText>
              <AppText selectable numberOfLines={1}>
                {user.email}
              </AppText>
            </View>
          </View>
        ) : null}
      </Surface>
    </ScreenScroll>
  );
}

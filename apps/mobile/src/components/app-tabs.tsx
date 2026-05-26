import {
  Add01Icon,
  Agreement01Icon,
  CheckListIcon,
  Home01Icon,
  Logout03Icon,
  UserIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { router, Tabs } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";

function HomeTabIcon({
  focused,
  color,
  accent,
}: {
  focused: boolean;
  color: string;
  accent: string;
}) {
  return <AppIcon icon={Home01Icon} size={20} color={focused ? accent : color} />;
}

function ListTabIcon({
  focused,
  color,
  accent,
}: {
  focused: boolean;
  color: string;
  accent: string;
}) {
  return <AppIcon icon={CheckListIcon} size={20} color={focused ? accent : color} />;
}

function CandidatesTabIcon({
  focused,
  color,
  accent,
}: {
  focused: boolean;
  color: string;
  accent: string;
}) {
  return <AppIcon icon={UserGroupIcon} size={20} color={focused ? accent : color} />;
}

function AdoptionsTabIcon({
  focused,
  color,
  accent,
}: {
  focused: boolean;
  color: string;
  accent: string;
}) {
  return <AppIcon icon={Agreement01Icon} size={20} color={focused ? accent : color} />;
}

function RegisterTabIcon({
  focused,
  color,
  accent,
}: {
  focused: boolean;
  color: string;
  accent: string;
}) {
  return (
    <View
      className="mt-[-32px] h-12 w-12 items-center justify-center rounded-full"
      style={{ backgroundColor: accent }}
    >
      <AppIcon icon={Add01Icon} size={24} color={focused ? "#17201A" : color} strokeWidth={2.2} />
    </View>
  );
}

function getUserInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

function UserHeaderAvatar({
  image,
  name,
  onPress,
}: {
  image?: string | null;
  name: string;
  onPress: () => void;
}) {
  const colors = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Usuário conectado: ${name}`}
      onPress={onPress}
      className="mr-4 h-9 w-9 items-center justify-center overflow-hidden rounded-full"
      style={{
        backgroundColor: colors.accentSoft,
        borderColor: colors.border,
        borderWidth: 1,
      }}
    >
      {image ? (
        <Image source={{ uri: image }} accessibilityIgnoresInvertColors className="h-full w-full" />
      ) : (
        <AppText className="text-sm font-extrabold leading-5 text-app-accent dark:text-app-accent-dark">
          {getUserInitials(name)}
        </AppText>
      )}
    </Pressable>
  );
}

function UserMenuDialog({
  visible,
  userName,
  userEmail,
  userImage,
  isSigningOut,
  onClose,
  onProfilePress,
  onLogoutPress,
}: {
  visible: boolean;
  userName: string;
  userEmail?: string | null;
  userImage?: string | null;
  isSigningOut: boolean;
  onClose: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
}) {
  const colors = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar menu do usuário"
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/35 px-6"
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="w-full max-w-[360px] overflow-hidden rounded-xl border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark"
          style={{
            boxShadow: [
              {
                offsetX: 0,
                offsetY: 12,
                blurRadius: 36,
                spreadDistance: 2,
                color: "rgba(0,0,0,0.2)",
                inset: false,
              },
            ],
          }}
        >
          <View className="flex-row items-center gap-3 border-b border-app-border p-4 dark:border-app-border-dark">
            <View
              className="h-12 w-12 items-center justify-center overflow-hidden rounded-full"
              style={{ backgroundColor: colors.accentSoft }}
            >
              {userImage ? (
                <Image
                  source={{ uri: userImage }}
                  accessibilityIgnoresInvertColors
                  className="h-full w-full"
                />
              ) : (
                <AppText className="text-lg font-extrabold leading-6 text-app-accent dark:text-app-accent-dark">
                  {getUserInitials(userName)}
                </AppText>
              )}
            </View>
            <View className="min-w-0 flex-1">
              <AppText className="font-bold" numberOfLines={1}>
                {userName}
              </AppText>
              {userEmail ? (
                <AppText tone="muted" numberOfLines={1}>
                  {userEmail}
                </AppText>
              ) : null}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onProfilePress}
            className="min-h-[52px] flex-row items-center gap-3 px-4"
          >
            <AppIcon icon={UserIcon} size={22} color={colors.text} />
            <AppText className="flex-1 font-bold">Perfil</AppText>
          </Pressable>

          <View className="h-px bg-app-border dark:bg-app-border-dark" />

          <Pressable
            accessibilityRole="button"
            onPress={onLogoutPress}
            disabled={isSigningOut}
            className="min-h-[52px] flex-row items-center gap-3 px-4"
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#E11D48" />
            ) : (
              <AppIcon icon={Logout03Icon} size={22} color="#E11D48" />
            )}
            <AppText className="flex-1 font-bold text-app-danger">
              {isSigningOut ? "Saindo..." : "Logout"}
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function AppTabs() {
  const colors = useTheme();
  const { data: session } = authClient.useSession();
  const userName = session?.user.name || session?.user.email || "Usuário";
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleProfilePress = () => {
    setIsUserMenuOpen(false);
    router.push("/private/perfil");
  };

  const handleLogoutPress = async () => {
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();

      if (result.error) {
        Alert.alert("Falha ao sair", result.error.message || "Tente novamente.");
        return;
      }

      setIsUserMenuOpen(false);
      router.replace("/login");
    } catch {
      Alert.alert("Falha ao sair", "Tente novamente.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: "Santuario Maringa",
        headerTitleStyle: {
          color: colors.text,
          fontSize: 20,
          fontWeight: "800",
        },
        headerTitleAlign: "left",
        headerStyle: {
          backgroundColor: colors.backgroundElement,
          boxShadow: [
            {
              offsetX: 5,
              offsetY: 5,
              blurRadius: 32,
              spreadDistance: 1,
              color: "rgba(0,0,0,0.1)",
              inset: false,
            },
          ],
        },
        headerShadowVisible: false,
        headerRight: () =>
          session?.user ? (
            <>
              <UserHeaderAvatar
                image={session.user.image}
                name={userName}
                onPress={() => setIsUserMenuOpen(true)}
              />
              <UserMenuDialog
                visible={isUserMenuOpen}
                userName={userName}
                userEmail={session.user.email}
                userImage={session.user.image}
                isSigningOut={isSigningOut}
                onClose={() => setIsUserMenuOpen(false)}
                onProfilePress={handleProfilePress}
                onLogoutPress={handleLogoutPress}
              />
            </>
          ) : null,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 80,
          paddingTop: 8,
          paddingHorizontal: 16,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <HomeTabIcon accent={colors.accent} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="gatos"
        options={{
          title: "Gatos",
          tabBarIcon: ({ color, focused }) => (
            <ListTabIcon accent={colors.accent} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="cadastrar"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <RegisterTabIcon accent={colors.accent} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="candidatos"
        options={{
          title: "Candidatos",
          tabBarIcon: ({ color, focused }) => (
            <CandidatesTabIcon accent={colors.accent} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="adocoes"
        options={{
          title: "Adoções",
          tabBarIcon: ({ color, focused }) => (
            <AdoptionsTabIcon accent={colors.accent} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="residente/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen name="candidato/[id]" options={{ href: null }} />

      <Tabs.Screen name="perfil" options={{ href: null, title: "Perfil" }} />
    </Tabs>
  );
}

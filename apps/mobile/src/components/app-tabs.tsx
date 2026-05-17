import { Add01Icon, CheckListIcon, Home01Icon } from "@hugeicons/core-free-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Tabs } from "expo-router";

import { AppIcon } from "@/components/ui/icon";
import { useTheme } from "@/hooks/use-theme";

function HomeTabIcon({ focused, color }: { focused: boolean; color: string }) {
  return <AppIcon icon={Home01Icon} size={20} color={focused ? undefined : color} />;
}

function ListTabIcon({ focused, color }: { focused: boolean; color: string }) {
  return <AppIcon icon={CheckListIcon} size={20} color={focused ? undefined : color} />;
}

export default function AppTabs() {
  const colors = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 14,
          backgroundColor: colors.backgroundElement,
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
          tabBarIcon: ({ color, focused }) => <HomeTabIcon color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="gatos"
        options={{
          title: "Gatos",
          tabBarIcon: ({ color, focused }) => <ListTabIcon color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="cadastrar"
        options={{
          title: "Cadastrar",
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <Pressable
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              onPress={props.onPress}
              onLongPress={props.onLongPress}
              className="mt-[-24px] flex-1 items-center justify-start"
            >
              <View
                className="h-[60px] w-[60px] items-center justify-center rounded-full shadow-ambient"
                style={{ backgroundColor: colors.accent }}
              >
                <AppIcon icon={Add01Icon} size={16} color="#FFF8F1" strokeWidth={2.2} />
              </View>
              <Text className="mt-1.5 text-[12px] font-bold" style={{ color: colors.text }}>
                Cadastrar
              </Text>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="residente/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

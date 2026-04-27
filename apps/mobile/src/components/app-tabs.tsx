import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tabs } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

function HomeTabIcon({ focused, color }: { focused: boolean; color: string }) {
  const colors = useTheme();

  return (
    <View className="h-[18px] w-[18px] flex-row flex-wrap gap-0.5">
      {[0, 1, 2, 3].map((cell) => (
        <View
          key={cell}
          className="h-2 w-2 rounded-[2px] border-[1.5px]"
          style={{
            borderColor: focused ? colors.accent : color,
            backgroundColor: focused ? colors.accentSoft : 'transparent',
          }}
        />
      ))}
    </View>
  );
}

function ListTabIcon({ focused, color }: { focused: boolean; color: string }) {
  const colors = useTheme();

  return (
    <View className="w-[18px] justify-center gap-[3px]">
      {[0, 1, 2].map((line) => (
        <View
          key={line}
          className="h-0.5 rounded-full"
          style={{ backgroundColor: focused ? colors.accent : color }}
        />
      ))}
    </View>
  );
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
          height: 86,
          paddingBottom: 16,
          paddingTop: 10,
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => <HomeTabIcon color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="gatos"
        options={{
          title: 'Gatos',
          tabBarIcon: ({ color, focused }) => <ListTabIcon color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="cadastrar"
        options={{
          title: 'Cadastrar',
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <Pressable
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityLabel={props.accessibilityLabel}
              testID={props.testID}
              onPress={props.onPress}
              onLongPress={props.onLongPress}
              className="mt-[-28px] flex-1 items-center justify-start">
              <View
                className="h-[62px] w-[62px] items-center justify-center rounded-full shadow-ambient"
                style={{ backgroundColor: colors.accent }}>
                <Text className="text-[30px] font-medium leading-[32px] text-[#FFF8F1]">+</Text>
              </View>
              <Text className="mt-1.5 text-xs font-bold" style={{ color: colors.text }}>
                Cadastrar
              </Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

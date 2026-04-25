import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.gridIcon}>
              {[0, 1, 2, 3].map((cell) => (
                <View
                  key={cell}
                  style={[
                    styles.gridCell,
                    { borderColor: color },
                    focused && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
                  ]}
                />
              ))}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="gatos"
        options={{
          title: 'Gatos',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.listIcon}>
              {[0, 1, 2].map((line) => (
                <View
                  key={line}
                  style={[
                    styles.listLine,
                    { backgroundColor: color },
                    focused && { backgroundColor: colors.accent },
                  ]}
                />
              ))}
            </View>
          ),
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
              style={({ pressed }) => [
                styles.actionButtonWrap,
                pressed && styles.actionButtonWrapPressed,
              ]}>
              <View style={[styles.actionButtonCore, { backgroundColor: colors.accent }]}>
                <Text style={styles.actionButtonPlus}>+</Text>
              </View>
              <Text style={[styles.actionButtonLabel, { color: colors.text }]}>Cadastrar</Text>
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  gridIcon: {
    width: 18,
    height: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 1.5,
  },
  listIcon: {
    width: 18,
    gap: 3,
    justifyContent: 'center',
  },
  listLine: {
    height: 2,
    borderRadius: 999,
  },
  actionButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -28,
  },
  actionButtonWrapPressed: {
    opacity: 0.92,
  },
  actionButtonCore: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  actionButtonPlus: {
    fontSize: 30,
    lineHeight: 32,
    color: '#FFF8F1',
    fontWeight: '500',
  },
  actionButtonLabel: {
    marginTop: Spacing.one + 2,
    fontSize: 12,
    fontWeight: '700',
  },
});

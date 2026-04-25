import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type ResidentAvatarProps = {
  name: string;
  size?: number;
};

export function ResidentAvatar({ name, size = 52 }: ResidentAvatarProps) {
  const theme = useTheme();
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.accentSoft,
        },
      ]}>
      <ThemedText style={[styles.letter, { color: theme.accent, fontSize: size * 0.34 }]}>
        {initial}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ResidentStatus } from '@/data/residents';
import { useTheme } from '@/hooks/use-theme';

type StatusChipProps = {
  status: ResidentStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  const theme = useTheme();

  const palette =
    status === 'Residente Permanente'
      ? { backgroundColor: theme.accentSoft, color: theme.accent }
      : status === 'Em Tratamento'
        ? { backgroundColor: theme.warningSoft, color: theme.warningText }
        : status === 'Adotado'
          ? { backgroundColor: theme.successSoft, color: theme.successText }
          : { backgroundColor: theme.accentSoft, color: theme.accent };

  return (
    <View style={[styles.chip, { backgroundColor: palette.backgroundColor }]}>
      <ThemedText type="smallBold" style={[styles.text, { color: palette.color }]}>
        {status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    lineHeight: 14,
  },
});

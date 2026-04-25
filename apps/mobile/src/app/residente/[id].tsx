import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResidentAvatar } from '@/components/resident-avatar';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getResidentById } from '@/data/residents';
import { useTheme } from '@/hooks/use-theme';

export default function ResidentDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resident = getResidentById(id ?? '');

  if (!resident) {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.missingState}>
            <ThemedText type="subtitle" style={styles.heading}>
              Residente não encontrado
            </ThemedText>
            <Pressable onPress={() => router.back()} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText style={{ color: theme.accent }}>Voltar</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const infoRows = [
    ['Data de Entrada', resident.entryDate],
    ['Nascimento', resident.birthDate],
    ['Raça', resident.breed],
    ['Peso', `${resident.weightKg} kg`],
  ];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.five }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
              <ThemedText style={styles.topBarIcon}>‹</ThemedText>
            </Pressable>

            <View style={styles.topBarActions}>
              <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <ThemedText themeColor="textSecondary">✎</ThemedText>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <ThemedText style={{ color: '#F05A4F' }}>⌫</ThemedText>
              </Pressable>
            </View>
          </View>

          <ThemedView type="backgroundElement" style={[styles.heroCard, { backgroundColor: theme.accentSoft }]}>
            <ResidentAvatar name={resident.name} size={116} />
            <View style={styles.heroMeta}>
              <View style={styles.heroText}>
                <ThemedText type="subtitle" style={styles.heroName}>
                  {resident.name}
                </ThemedText>
                <ThemedText themeColor="textSecondary">
                  {resident.sex} · {resident.coat}
                </ThemedText>
              </View>
              <StatusChip status={resident.status} />
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Informações
            </ThemedText>
            {infoRows.map(([label, value], index) => (
              <View
                key={label}
                style={[
                  styles.infoRow,
                  index < infoRows.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.border,
                  },
                ]}>
                <ThemedText themeColor="textSecondary">{label}</ThemedText>
                <ThemedText style={styles.infoValue}>{value}</ThemedText>
              </View>
            ))}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Saúde
            </ThemedText>
            <View style={styles.healthRow}>
              <ThemedText themeColor="textSecondary">♡ Castrado(a)</ThemedText>
              <View style={[styles.healthBadge, { backgroundColor: resident.neutered ? theme.successSoft : theme.border }]}>
                <ThemedText style={{ color: resident.neutered ? theme.successText : theme.textSecondary }}>
                  {resident.neutered ? 'Sim' : 'Não'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.healthRow}>
              <ThemedText themeColor="textSecondary">⌁ Vacinado(a)</ThemedText>
              <View style={[styles.healthBadge, { backgroundColor: resident.vaccinated ? theme.successSoft : theme.border }]}>
                <ThemedText style={{ color: resident.vaccinated ? theme.successText : theme.textSecondary }}>
                  {resident.vaccinated ? 'Sim' : 'Não'}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.section}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionLabel}>
              Observações
            </ThemedText>
            <ThemedText themeColor="textSecondary">{resident.notes}</ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  content: {
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  iconButton: {
    minWidth: 28,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarIcon: {
    fontSize: 30,
    lineHeight: 28,
  },
  heroCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.three,
    minHeight: 356,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroMeta: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    fontSize: 28,
    lineHeight: 32,
  },
  section: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  infoRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoValue: {
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '55%',
  },
  healthRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthBadge: {
    minWidth: 46,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  missingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
  },
  pressed: {
    opacity: 0.82,
  },
});

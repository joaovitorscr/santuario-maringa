import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResidentAvatar } from '@/components/resident-avatar';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { residents } from '@/data/residents';
import { useTheme } from '@/hooks/use-theme';

const latestResidents = residents.slice(0, 5);

export default function HomeScreen() {
  const theme = useTheme();

  const neuteredCount = residents.filter((resident) => resident.neutered).length;
  const vaccinatedCount = residents.filter((resident) => resident.vaccinated).length;
  const treatmentCount = residents.filter((resident) => resident.status === 'Em Tratamento').length;

  const stats = [
    {
      label: 'Residentes',
      value: String(residents.length),
      helper: '0 nos últimos 30 dias',
      icon: '◌',
    },
    {
      label: 'Castrados',
      value: `${Math.round((neuteredCount / residents.length) * 100)}%`,
      helper: `${neuteredCount} de ${residents.length}`,
      icon: '♡',
    },
    {
      label: 'Vacinados',
      value: `${Math.round((vaccinatedCount / residents.length) * 100)}%`,
      helper: `${vaccinatedCount} de ${residents.length}`,
      icon: '⌁',
    },
    {
      label: 'Tratamento',
      value: String(treatmentCount),
      helper: 'Atenção médica',
      icon: '⌇',
    },
  ];

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.five }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.heading}>
              Visão Geral
            </ThemedText>
            <ThemedText themeColor="textSecondary">Resumo do santuário</ThemedText>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <ThemedView key={stat.label} type="backgroundElement" style={styles.statCard}>
                <View style={styles.statTopRow}>
                  <ThemedText type="smallBold" themeColor="textSecondary" style={styles.statLabel}>
                    {stat.label}
                  </ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.statIcon}>
                    {stat.icon}
                  </ThemedText>
                </View>
                <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
                <ThemedText themeColor="textSecondary">{stat.helper}</ThemedText>
              </ThemedView>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Últimas Chegadas
            </ThemedText>
            <Pressable onPress={() => router.push('/gatos')} style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText style={[styles.linkText, { color: theme.accent }]}>Ver todos ›</ThemedText>
            </Pressable>
          </View>

          <ThemedView type="backgroundElement" style={styles.listSurface}>
            {latestResidents.map((resident, index) => (
              <Pressable
                key={resident.id}
                onPress={() => router.push(`/residente/${resident.id}`)}
                style={({ pressed }) => [pressed && styles.pressed, styles.rowPressable]}>
                <View
                  style={[
                    styles.residentRow,
                    index < latestResidents.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.border,
                    },
                  ]}>
                  <ResidentAvatar name={resident.name} />
                  <View style={styles.residentInfo}>
                    <ThemedText style={styles.name}>{resident.name}</ThemedText>
                    <ThemedText themeColor="textSecondary">
                      {resident.sex} · {resident.entryDate}
                    </ThemedText>
                  </View>
                  <StatusChip status={resident.status} />
                </View>
              </Pressable>
            ))}
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
    gap: Spacing.four,
  },
  header: {
    gap: 2,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  statCard: {
    width: '47.5%',
    minHeight: 118,
    borderRadius: 14,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listSurface: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rowPressable: {
    paddingHorizontal: Spacing.three,
  },
  residentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: Spacing.three,
  },
  residentInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});

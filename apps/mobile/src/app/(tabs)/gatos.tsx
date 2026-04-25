import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ResidentAvatar } from '@/components/resident-avatar';
import { StatusChip } from '@/components/status-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { residents } from '@/data/residents';
import { useTheme } from '@/hooks/use-theme';

const statusOptions = ['Todos os status', 'Residente Permanente', 'Em Processo de Adoção', 'Em Tratamento', 'Adotado'] as const;
const genderOptions = ['Ambos', 'Fêmea', 'Macho'] as const;

export default function CatsScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('Todos os status');
  const [genderFilter, setGenderFilter] = useState<(typeof genderOptions)[number]>('Ambos');

  const filteredResidents = residents.filter((resident) => {
    const matchesQuery =
      query.trim().length === 0 ||
      resident.name.toLowerCase().includes(query.toLowerCase()) ||
      resident.coat.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === 'Todos os status' || resident.status === statusFilter;
    const matchesGender = genderFilter === 'Ambos' || resident.sex === genderFilter;

    return matchesQuery && matchesStatus && matchesGender;
  });

  const cycleStatus = () => {
    const nextIndex = (statusOptions.indexOf(statusFilter) + 1) % statusOptions.length;
    setStatusFilter(statusOptions[nextIndex]);
  };

  const cycleGender = () => {
    const nextIndex = (genderOptions.indexOf(genderFilter) + 1) % genderOptions.length;
    setGenderFilter(genderOptions[nextIndex]);
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.five }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.heading}>
              Residentes
            </ThemedText>
            <ThemedText themeColor="textSecondary">{filteredResidents.length} registros</ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.filterSurface}>
            <View style={[styles.searchRow, { borderBottomColor: theme.border }]}>
              <ThemedText themeColor="textSecondary" style={styles.searchIcon}>
                ⌕
              </ThemedText>
              <TextInput
                placeholder="Buscar por nome..."
                placeholderTextColor={theme.textSecondary}
                value={query}
                onChangeText={setQuery}
                style={[styles.searchInput, { color: theme.text }]}
              />
            </View>

            <View style={styles.filterRow}>
              <Pressable
                onPress={cycleStatus}
                style={({ pressed }) => [styles.filterButton, pressed && styles.pressed, { borderRightColor: theme.border }]}>
                <ThemedText themeColor="textSecondary">{statusFilter}</ThemedText>
                <ThemedText themeColor="textSecondary">⌄</ThemedText>
              </Pressable>

              <Pressable onPress={cycleGender} style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}>
                <ThemedText themeColor="textSecondary">{genderFilter}</ThemedText>
                <ThemedText themeColor="textSecondary">⌄</ThemedText>
              </Pressable>
            </View>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.listSurface}>
            {filteredResidents.map((resident, index) => (
              <Pressable
                key={resident.id}
                onPress={() => router.push(`/residente/${resident.id}`)}
                style={({ pressed }) => [pressed && styles.pressed, styles.itemPressable]}>
                <View
                  style={[
                    styles.itemRow,
                    index < filteredResidents.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: theme.border,
                    },
                  ]}>
                  <ResidentAvatar name={resident.name} />
                  <View style={styles.itemInfo}>
                    <ThemedText style={styles.itemName}>{resident.name}</ThemedText>
                    <ThemedText themeColor="textSecondary" numberOfLines={1}>
                      {resident.sex} · {resident.coat}
                    </ThemedText>
                    <ThemedText themeColor="textSecondary">Entrada: {resident.entryDate}</ThemedText>
                  </View>
                  <View style={styles.itemAside}>
                    <StatusChip status={resident.status} />
                    <ThemedText themeColor="textSecondary" style={styles.chevron}>
                      ›
                    </ThemedText>
                  </View>
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
  filterSurface: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  listSurface: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemPressable: {
    paddingHorizontal: Spacing.three,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  itemInfo: {
    flex: 1,
    gap: 1,
  },
  itemAside: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemName: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 20,
    lineHeight: 22,
  },
  pressed: {
    opacity: 0.82,
  },
});

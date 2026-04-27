import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { HeaderBlock } from '@/components/ui/layout';
import { ResidentListItem } from '@/components/ui/resident-list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Surface } from '@/components/ui/surface';
import { residents } from '@/data/residents';
import { useTheme } from '@/hooks/use-theme';

const statusOptions = [
  'Todos os status',
  'Residente Permanente',
  'Em Processo de Adoção',
  'Em Tratamento',
  'Adotado',
] as const;
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
    <ScreenScroll>
      <HeaderBlock title="Residentes" subtitle={`${filteredResidents.length} registros`} />

      <Surface className="overflow-hidden">
        <View className="flex-row items-center gap-2 border-b border-app-border px-4 py-3.5 dark:border-app-border-dark">
          <AppText tone="muted" className="text-base">
            ⌕
          </AppText>
          <TextInput
            placeholder="Buscar por nome..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            className="flex-1 text-base font-medium text-app-text dark:text-app-text-dark"
          />
        </View>

        <View className="flex-row">
          <Pressable
            onPress={cycleStatus}
            className="min-h-[42px] flex-1 flex-row items-center justify-between border-r border-app-border px-4 dark:border-app-border-dark">
            <AppText tone="muted">{statusFilter}</AppText>
            <AppText tone="muted">⌄</AppText>
          </Pressable>

          <Pressable
            onPress={cycleGender}
            className="min-h-[42px] flex-1 flex-row items-center justify-between px-4">
            <AppText tone="muted">{genderFilter}</AppText>
            <AppText tone="muted">⌄</AppText>
          </Pressable>
        </View>
      </Surface>

      <Surface className="overflow-hidden">
        {filteredResidents.map((resident, index) => (
          <View
            key={resident.id}
            className={index < filteredResidents.length - 1 ? 'border-b border-app-border dark:border-app-border-dark' : ''}>
            <ResidentListItem
              id={resident.id}
              name={resident.name}
              meta={`${resident.sex} · ${resident.coat}`}
              detail={`Entrada: ${resident.entryDate}`}
              status={resident.status}
              showChevron
            />
          </View>
        ))}
      </Surface>
    </ScreenScroll>
  );
}

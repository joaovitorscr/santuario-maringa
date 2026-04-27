import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { ResidentAvatar } from '@/components/resident-avatar';
import { StatusChip } from '@/components/status-chip';
import { HealthBadge, IconButton } from '@/components/ui/button';
import { AppText } from '@/components/ui/app-text';
import { SectionLabel } from '@/components/ui/layout';
import { ScreenScroll } from '@/components/ui/screen';
import { Surface } from '@/components/ui/surface';
import { getResidentById } from '@/data/residents';

export default function ResidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resident = getResidentById(id ?? '');

  if (!resident) {
    return (
      <ScreenScroll contentClassName="flex-1 items-center justify-center gap-2">
        <AppText variant="subtitle">Residente não encontrado</AppText>
        <AppText variant="link" onPress={() => router.back()}>
          Voltar
        </AppText>
      </ScreenScroll>
    );
  }

  const infoRows = [
    ['Data de Entrada', resident.entryDate],
    ['Nascimento', resident.birthDate],
    ['Raça', resident.breed],
    ['Peso', `${resident.weightKg} kg`],
  ];

  return (
    <ScreenScroll contentClassName="gap-3 pb-28 pt-6">
      <View className="flex-row items-center justify-between">
        <IconButton icon="‹" onPress={() => router.back()} className="min-h-8 min-w-8" />

        <View className="flex-row items-center gap-1">
          <IconButton icon="✎" />
          <IconButton icon="⌫" tone="danger" />
        </View>
      </View>

      <Surface tone="accentSoft" className="min-h-[356px] items-center justify-between gap-4 p-4">
        <ResidentAvatar name={resident.name} size="hero" />
        <View className="w-full flex-row items-end justify-between gap-2">
          <View className="flex-1 gap-0.5">
            <AppText variant="subtitle">{resident.name}</AppText>
            <AppText tone="muted">
              {resident.sex} · {resident.coat}
            </AppText>
          </View>
          <StatusChip status={resident.status} />
        </View>
      </Surface>

      <Surface className="gap-2 p-4">
        <SectionLabel className="mb-1">Informações</SectionLabel>
        {infoRows.map(([label, value], index) => (
          <View
            key={label}
            className={`min-h-[50px] flex-row items-center justify-between ${
              index < infoRows.length - 1 ? 'border-b border-app-border dark:border-app-border-dark' : ''
            }`}>
            <AppText tone="muted">{label}</AppText>
            <AppText className="max-w-[55%] text-right font-bold">{value}</AppText>
          </View>
        ))}
      </Surface>

      <Surface className="gap-2 p-4">
        <SectionLabel className="mb-1">Saúde</SectionLabel>
        <View className="min-h-11 flex-row items-center justify-between">
          <AppText tone="muted">♡ Castrado(a)</AppText>
          <HealthBadge active={resident.neutered} label={resident.neutered ? 'Sim' : 'Não'} />
        </View>
        <View className="min-h-11 flex-row items-center justify-between">
          <AppText tone="muted">⌁ Vacinado(a)</AppText>
          <HealthBadge active={resident.vaccinated} label={resident.vaccinated ? 'Sim' : 'Não'} />
        </View>
      </Surface>

      <Surface className="gap-2 p-4">
        <SectionLabel className="mb-1">Observações</SectionLabel>
        <AppText tone="muted">{resident.notes}</AppText>
      </Surface>
    </ScreenScroll>
  );
}

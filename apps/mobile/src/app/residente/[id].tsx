import {
  ArrowLeft01Icon,
  Delete02Icon,
  Edit02Icon,
  FavouriteIcon,
  VaccineIcon,
} from '@hugeicons/core-free-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { ResidentAvatar } from '@/components/resident-avatar';
import { StatusChip } from '@/components/status-chip';
import { HealthBadge, IconButton } from '@/components/ui/button';
import { AppText } from '@/components/ui/app-text';
import { AppIcon } from '@/components/ui/icon';
import { SectionLabel } from '@/components/ui/layout';
import { ScreenScroll } from '@/components/ui/screen';
import { Surface } from '@/components/ui/surface';
import { ApiError } from '@/lib/api';
import { catQueryKeys, fetchResident } from '@/lib/cats';

export default function ResidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: resident, isLoading, error } = useQuery({
    queryKey: catQueryKeys.detail(id ?? ''),
    queryFn: () => fetchResident(id ?? ''),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <ScreenScroll contentClassName="flex-1 items-center justify-center gap-2">
        <AppText tone="muted">Carregando residente...</AppText>
      </ScreenScroll>
    );
  }

  if (error || !resident) {
    return (
      <ScreenScroll contentClassName="flex-1 items-center justify-center gap-2">
        <AppText variant="subtitle">
          {error instanceof ApiError ? error.message : 'Residente não encontrado'}
        </AppText>
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
        <IconButton icon={ArrowLeft01Icon} onPress={() => router.back()} />

        <View className="flex-row items-center gap-1">
          <IconButton icon={Edit02Icon} />
          <IconButton icon={Delete02Icon} tone="danger" />
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
          <View className="flex-row items-center gap-3">
            <AppIcon icon={FavouriteIcon} size={26} color="#7D7884" />
            <AppText tone="muted">Castrado(a)</AppText>
          </View>
          <HealthBadge active={resident.neutered} label={resident.neutered ? 'Sim' : 'Não'} />
        </View>
        <View className="min-h-11 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <AppIcon icon={VaccineIcon} size={26} color="#7D7884" />
            <AppText tone="muted">Vacinado(a)</AppText>
          </View>
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

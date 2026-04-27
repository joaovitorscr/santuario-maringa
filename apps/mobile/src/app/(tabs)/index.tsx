import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { HeaderBlock } from '@/components/ui/layout';
import { ResidentListItem } from '@/components/ui/resident-list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Surface } from '@/components/ui/surface';
import { residents } from '@/data/residents';

const latestResidents = residents.slice(0, 5);

export default function HomeScreen() {
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
    <ScreenScroll>
      <HeaderBlock title="Visão Geral" subtitle="Resumo do santuário" />

      <View className="flex-row flex-wrap gap-4">
        {stats.map((stat) => (
          <Surface
            key={stat.label}
            className="min-h-[118px] w-[47.5%] justify-between rounded-[14px] p-4">
            <View className="flex-row items-center justify-between">
              <AppText variant="label">{stat.label}</AppText>
              <AppText tone="muted" className="text-base">
                {stat.icon}
              </AppText>
            </View>
            <AppText className="text-[28px] font-extrabold leading-8">{stat.value}</AppText>
            <AppText tone="muted">{stat.helper}</AppText>
          </Surface>
        ))}
      </View>

      <View className="flex-row items-center justify-between">
        <AppText className="text-[18px] font-semibold leading-6">Últimas Chegadas</AppText>
        <Pressable onPress={() => router.push('/gatos')}>
          <AppText variant="link">Ver todos ›</AppText>
        </Pressable>
      </View>

      <Surface className="overflow-hidden">
        {latestResidents.map((resident, index) => (
          <View
            key={resident.id}
            className={index < latestResidents.length - 1 ? 'border-b border-app-border dark:border-app-border-dark' : ''}>
            <ResidentListItem
              id={resident.id}
              name={resident.name}
              meta={`${resident.sex} · ${resident.entryDate}`}
              status={resident.status}
              compact
            />
          </View>
        ))}
      </Surface>
    </ScreenScroll>
  );
}

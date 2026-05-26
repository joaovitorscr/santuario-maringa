import {
  ArrowRight01Icon,
  CheckListIcon,
  FavouriteIcon,
  InformationCircleIcon,
  ShieldBanIcon,
  VaccineIcon,
} from "@hugeicons/core-free-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ResidentListItem } from "@/components/ui/resident-list-item";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { useTheme } from "@/hooks/use-theme";
import { ApiError } from "@/lib/api";
import { catQueryKeys, fetchResidents } from "@/lib/cats";

export default function HomeScreen() {
  const theme = useTheme();
  const {
    data: residents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: catQueryKeys.all,
    queryFn: fetchResidents,
  });
  const latestResidents = residents.slice(0, 5);
  const neuteredCount = residents.filter(
    (resident) => resident.neutered,
  ).length;
  const vaccinatedCount = residents.filter(
    (resident) => resident.vaccinated,
  ).length;
  const unavailableCount = residents.filter(
    (resident) => resident.status === "Indisponível",
  ).length;
  const residentCount = residents.length || 1;

  const stats = [
    {
      label: "Residentes",
      value: String(residents.length),
      helper: "0 nos últimos 30 dias",
      icon: CheckListIcon,
    },
    {
      label: "Castrados",
      value: `${Math.round((neuteredCount / residentCount) * 100)}%`,
      helper: `${neuteredCount} de ${residents.length}`,
      icon: FavouriteIcon,
    },
    {
      label: "Vacinados",
      value: `${Math.round((vaccinatedCount / residentCount) * 100)}%`,
      helper: `${vaccinatedCount} de ${residents.length}`,
      icon: VaccineIcon,
    },
    {
      label: "Indisponíveis",
      value: String(unavailableCount),
      helper: "Fora de adoção",
      icon: ShieldBanIcon,
    },
  ];

  return (
    <ScreenScroll>
      <HeaderBlock title="Visão Geral" subtitle="Resumo do santuário" />

      <View className="flex-row flex-wrap gap-4">
        {stats.map((stat) => (
          <Surface
            key={stat.label}
            className="min-h-[118px] w-[47.5%] justify-between p-4"
          >
            <View className="flex-row items-center justify-between">
              <AppText variant="label">{stat.label}</AppText>
              <AppIcon icon={stat.icon} size={18} color={theme.textSecondary} />
            </View>
            <AppText className="text-[28px] font-extrabold leading-8">
              {stat.value}
            </AppText>
            <AppText tone="muted">{stat.helper}</AppText>
          </Surface>
        ))}
      </View>

      <View className="flex-row items-center justify-between">
        <SectionHeader icon={InformationCircleIcon} label="Últimas Chegadas" />
        <Pressable
          onPress={() => router.push("/private/gatos")}
          className="flex-row items-center gap-1.5"
        >
          <AppText variant="link" className="text-[22px] leading-7">
            Ver todos
          </AppText>
          <AppIcon icon={ArrowRight01Icon} size={22} />
        </Pressable>
      </View>

      <Surface className="overflow-hidden">
        {isLoading ? (
          <View className="px-4 py-6">
            <AppText tone="muted">Carregando residentes...</AppText>
          </View>
        ) : error ? (
          <View className="px-4 py-6">
            <AppText tone="danger">
              {error instanceof ApiError
                ? error.message
                : "Não foi possível carregar o resumo."}
            </AppText>
          </View>
        ) : latestResidents.length === 0 ? (
          <View className="px-4 py-6">
            <AppText tone="muted">Nenhum residente cadastrado ainda.</AppText>
          </View>
        ) : (
          latestResidents.map((resident, index) => (
            <View
              key={resident.id}
              className={
                index < latestResidents.length - 1
                  ? "border-b border-app-border dark:border-app-border-dark"
                  : ""
              }
            >
              <ResidentListItem
                id={resident.id}
                name={resident.name}
                pictureBase64={resident.pictureBase64}
                meta={`${resident.sex} · ${resident.entryDate}`}
                status={resident.status}
                compact
              />
            </View>
          ))
        )}
      </Surface>
    </ScreenScroll>
  );
}

import {
  Add01Icon,
  Agreement01Icon,
  Calendar03Icon,
  FavouriteIcon,
  Note01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react-native";
import { useQuery } from "@tanstack/react-query";
import { Link, type Href } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { ApiError } from "@/lib/api";
import { type ApiAdoption, adoptionQueryKeys, fetchAdoptions } from "@/lib/adoptions";

const newAdoptionHref = "/private/adocao/nova" as Href;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default function AdoptionsScreen() {
  const {
    data: adoptions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: adoptionQueryKeys.all,
    queryFn: fetchAdoptions,
  });

  return (
    <ScreenScroll>
      <Surface tone="accentSoft" className="gap-4 p-5">
        <View className="flex-row items-start justify-between gap-3">
          <HeaderBlock
            className="flex-1"
            title="Adoções"
            subtitle={`${adoptions.length} registros`}
          />
          <Link href={newAdoptionHref} asChild>
            <Pressable className="h-11 w-11 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
              <AppIcon icon={Add01Icon} size={24} />
            </Pressable>
          </Link>
        </View>
        <Link href={newAdoptionHref} asChild>
          <Pressable className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-lg bg-app-accent px-4 dark:bg-app-accent-dark">
            <AppIcon icon={Agreement01Icon} size={22} color="#1F2933" />
            <AppText className="text-lg font-bold leading-[22px] text-app-text">
              Nova adoção
            </AppText>
          </Pressable>
        </Link>
      </Surface>

      <View className="flex-row items-center justify-between">
        <SectionHeader icon={Agreement01Icon} label="Histórico" />
        <AppText variant="smallBold" tone="muted">
          {adoptions.length}
        </AppText>
      </View>

      <Surface className="overflow-hidden">
        {isLoading ? (
          <View className="px-4 py-6">
            <AppText tone="muted">Carregando adoções...</AppText>
          </View>
        ) : error ? (
          <View className="px-4 py-6">
            <AppText tone="danger">
              {error instanceof ApiError ? error.message : "Não foi possível carregar as adoções."}
            </AppText>
          </View>
        ) : adoptions.length === 0 ? (
          <View className="gap-2 px-4 py-6">
            <AppText variant="smallBold">Nenhuma adoção cadastrada.</AppText>
            <AppText tone="muted">
              Use o botão Nova adoção para registrar o primeiro processo.
            </AppText>
          </View>
        ) : (
          adoptions.map((adoption, index) => (
            <View
              key={adoption.id}
              className={
                index < adoptions.length - 1
                  ? "border-b border-app-border dark:border-app-border-dark"
                  : ""
              }
            >
              <AdoptionListItem adoption={adoption} />
            </View>
          ))
        )}
      </Surface>
    </ScreenScroll>
  );
}

function AdoptionListItem({ adoption }: { adoption: ApiAdoption }) {
  const details: {
    icon: IconSvgElement;
    label: string;
    value: string;
  }[] = [
    {
      icon: UserIcon,
      label: "Adotante",
      value: adoption.adoptionCandidate.name,
    },
    {
      icon: Calendar03Icon,
      label: "Data",
      value: formatDate(adoption.adoptionDate),
    },
  ];

  return (
    <View className="gap-3 px-4 py-4">
      <View className="flex-row items-start gap-3">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-app-accent-soft dark:bg-app-accent-soft-dark">
          <AppIcon icon={FavouriteIcon} size={24} />
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <AppText className="text-[17px] font-bold leading-[21px]" selectable>
            {adoption.cat.name}
          </AppText>
          <AppText tone="muted" selectable>
            {adoption.adoptionCandidate.cellphone}
          </AppText>
        </View>
      </View>

      <View className="gap-2">
        {details.map((detail) => (
          <View key={detail.label} className="flex-row items-center gap-2">
            <AppIcon icon={detail.icon} size={17} />
            <AppText variant="small" tone="muted">
              {detail.label}
            </AppText>
            <AppText variant="smallBold" className="min-w-0 flex-1" selectable>
              {detail.value}
            </AppText>
          </View>
        ))}
      </View>

      {adoption.observation ? (
        <View className="flex-row items-start gap-2">
          <AppIcon icon={Note01Icon} size={17} />
          <AppText tone="muted" className="min-w-0 flex-1" selectable>
            {adoption.observation}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

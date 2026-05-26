import {
  Contact02Icon,
  Location01Icon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { type ApiAdoptionCandidate } from "@/lib/api";
import { ApiError } from "@/lib/api";
import {
  adoptionCandidateQueryKeys,
  fetchAdoptionCandidates,
} from "@/lib/adoption-candidates";
import { useTheme } from "@/hooks/use-theme";

export default function AdoptionCandidatesScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const {
    data: candidates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: adoptionCandidateQueryKeys.all,
    queryFn: fetchAdoptionCandidates,
  });

  const filteredCandidates = candidates.filter((candidate) => {
    const normalizedQuery = query.trim().toLowerCase();

    return (
      normalizedQuery.length === 0 ||
      candidate.name.toLowerCase().includes(normalizedQuery) ||
      candidate.cellphone.includes(normalizedQuery) ||
      (candidate.cpf?.includes(normalizedQuery) ?? false)
    );
  });

  return (
    <ScreenScroll>
      <HeaderBlock
        title="Candidatos"
        subtitle={`${filteredCandidates.length} registros`}
      />

      <Surface className="overflow-hidden">
        <View className="flex-row items-center gap-2 border-b border-app-border px-4 py-3.5 dark:border-app-border-dark">
          <AppIcon icon={Search01Icon} size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="Buscar por nome, celular ou CPF..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            className="flex-1 text-base font-medium text-app-text dark:text-app-text-dark"
          />
        </View>
      </Surface>

      <View className="flex-row items-center justify-between">
        <SectionHeader icon={Contact02Icon} label="Lista de Candidatos" />
        <AppText variant="smallBold" tone="muted">
          {filteredCandidates.length}
        </AppText>
      </View>

      <Surface className="overflow-hidden">
        {isLoading ? (
          <View className="px-4 py-6">
            <AppText tone="muted">Carregando candidatos...</AppText>
          </View>
        ) : error ? (
          <View className="px-4 py-6">
            <AppText tone="danger">
              {error instanceof ApiError
                ? error.message
                : "Não foi possível carregar os candidatos."}
            </AppText>
          </View>
        ) : filteredCandidates.length === 0 ? (
          <View className="px-4 py-6">
            <AppText tone="muted">Nenhum candidato encontrado.</AppText>
          </View>
        ) : (
          filteredCandidates.map((candidate, index) => (
            <View
              key={candidate.id}
              className={
                index < filteredCandidates.length - 1
                  ? "border-b border-app-border dark:border-app-border-dark"
                  : ""
              }
            >
              <CandidateListItem candidate={candidate} />
            </View>
          ))
        )}
      </Surface>
    </ScreenScroll>
  );
}

function CandidateListItem({ candidate }: { candidate: ApiAdoptionCandidate }) {
  return (
    <Link href={`/private/candidato/${candidate.id}`} asChild>
      <Pressable className="flex-row items-center gap-3 px-4 py-3.5">
        <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-app-accent-soft dark:bg-app-accent-soft-dark">
          <AppIcon icon={UserIcon} size={24} />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <AppText className="text-[17px] font-bold leading-[21px]">
            {candidate.name}
          </AppText>
          <AppText tone="muted">{candidate.cellphone}</AppText>
          {candidate.address ? (
            <View className="flex-row items-center gap-1.5">
              <AppIcon icon={Location01Icon} size={15} />
              <AppText tone="muted" numberOfLines={1}>
                {candidate.address}
              </AppText>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

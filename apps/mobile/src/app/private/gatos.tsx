import { Search01Icon } from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import { TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ResidentListItem } from "@/components/ui/resident-list-item";
import { ScreenScroll } from "@/components/ui/screen";
import { Surface } from "@/components/ui/surface";
import { SelectField } from "@/components/ui/form-fields";
import { fetchResidents, catQueryKeys } from "@/lib/cats";
import { ApiError } from "@/lib/api";
import { useTheme } from "@/hooks/use-theme";

const statusOptions = [
  "Todos os status",
  "Disponível",
  "Indisponível",
  "Em Processo de Adoção",
  "Adotado",
] as const;
const genderOptions = ["Ambos", "Fêmea", "Macho"] as const;

const statusItems = statusOptions.map((status) => ({
  label: status,
  value: status,
}));

const genderItems = genderOptions.map((gender) => ({
  label: gender,
  value: gender,
}));

export default function CatsScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>("Todos os status");
  const [genderFilter, setGenderFilter] = useState<(typeof genderOptions)[number]>("Ambos");
  const {
    data: residents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: catQueryKeys.all,
    queryFn: fetchResidents,
  });

  const filteredResidents = residents.filter((resident) => {
    const matchesQuery =
      query.trim().length === 0 ||
      resident.name.toLowerCase().includes(query.toLowerCase()) ||
      resident.coat.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === "Todos os status" || resident.status === statusFilter;
    const matchesGender = genderFilter === "Ambos" || resident.sex === genderFilter;

    return matchesQuery && matchesStatus && matchesGender;
  });

  return (
    <ScreenScroll>
      <HeaderBlock title="Residentes" subtitle={`${filteredResidents.length} registros`} />

      <Surface className="overflow-hidden">
        <View className="flex-row items-center gap-2 border-b border-app-border px-4 py-3.5 dark:border-app-border-dark">
          <AppIcon icon={Search01Icon} size={18} color={theme.textSecondary} />
          <TextInput
            placeholder="Buscar por nome..."
            placeholderTextColor={theme.textSecondary}
            value={query}
            onChangeText={setQuery}
            className="flex-1 text-base font-medium text-app-text dark:text-app-text-dark"
          />
        </View>

        <View className="flex-row gap-3 p-3">
          <SelectField
            label="Status"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as (typeof statusOptions)[number])}
            items={statusItems}
          />
          <SelectField
            label="Gênero"
            value={genderFilter}
            onValueChange={(value) => setGenderFilter(value as (typeof genderOptions)[number])}
            items={genderItems}
          />
        </View>
      </Surface>

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
                : "Não foi possível carregar os residentes."}
            </AppText>
          </View>
        ) : filteredResidents.length === 0 ? (
          <View className="px-4 py-6">
            <AppText tone="muted">Nenhum residente encontrado.</AppText>
          </View>
        ) : (
          filteredResidents.map((resident, index) => (
            <View
              key={resident.id}
              className={
                index < filteredResidents.length - 1
                  ? "border-b border-app-border dark:border-app-border-dark"
                  : ""
              }
            >
              <ResidentListItem
                id={resident.id}
                name={resident.name}
                meta={`${resident.sex} · ${resident.coat}`}
                detail={`Entrada: ${resident.entryDate}`}
                status={resident.status}
                showChevron
              />
            </View>
          ))
        )}
      </Surface>
    </ScreenScroll>
  );
}

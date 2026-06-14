import {
  ArrowLeft01Icon,
  Delete02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";

import { CatForm } from "@/components/cat-form";
import { ResidentProfile } from "@/components/resident-profile";
import { IconButton } from "@/components/ui/button";
import { AppText } from "@/components/ui/app-text";
import { ScreenScroll } from "@/components/ui/screen";
import { ApiError } from "@/lib/api";
import { catQueryKeys, deleteCat, fetchResident } from "@/lib/cats";

export default function ResidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const {
    data: resident,
    isLoading,
    error,
  } = useQuery({
    queryKey: catQueryKeys.detail(id ?? ""),
    queryFn: () => fetchResident(id ?? ""),
    enabled: Boolean(id),
  });
  const deleteCatMutation = useMutation({
    mutationFn: deleteCat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catQueryKeys.all });
      router.replace("/private/gatos");
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof ApiError || mutationError instanceof Error
          ? mutationError.message
          : "Tente novamente.";

      Alert.alert("Falha ao excluir", message);
    },
  });

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }

    router.back();
  };

  const handleDeletePress = () => {
    if (!resident || deleteCatMutation.isPending) {
      return;
    }

    Alert.alert(
      "Excluir residente",
      `Tem certeza que deseja excluir ${resident.name}? Esta acao nao pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteCatMutation.mutate(resident.id),
        },
      ],
    );
  };

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
          {error instanceof ApiError
            ? error.message
            : "Residente não encontrado"}
        </AppText>
        <AppText variant="link" onPress={() => router.back()}>
          Voltar
        </AppText>
      </ScreenScroll>
    );
  }

  if (isEditing) {
    return (
      <ScreenScroll contentClassName="gap-4 pb-28 pt-3">
        <CatForm
          mode="edit"
          resident={resident}
          onBack={() => setIsEditing(false)}
        />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll contentClassName="gap-3 pb-28 pt-3">
      <View className="flex-row items-center justify-between">
        <IconButton
          icon={ArrowLeft01Icon}
          size="compact"
          onPress={handleBack}
        />

        <View className="flex-row items-center gap-1">
          <IconButton
            icon={Edit02Icon}
            size="compact"
            onPress={() => setIsEditing(true)}
          />
          <IconButton
            icon={Delete02Icon}
            size="compact"
            tone="danger"
            disabled={deleteCatMutation.isPending}
            onPress={handleDeletePress}
          />
        </View>
      </View>

      <ResidentProfile resident={resident} />
    </ScreenScroll>
  );
}

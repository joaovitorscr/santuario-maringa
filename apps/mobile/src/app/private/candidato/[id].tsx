import {
  ArrowLeft01Icon,
  Calendar03Icon,
  Contact02Icon,
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
  Note01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";

import { AdoptionCandidateForm } from "@/components/adoption-candidate";
import { AppText } from "@/components/ui/app-text";
import { IconButton } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import {
  adoptionCandidateQueryKeys,
  deleteAdoptionCandidate,
  fetchAdoptionCandidate,
  type ApiAdoptionCandidate,
} from "@/lib/adoption-candidates";
import { ApiError } from "@/lib/api";
import { useTheme } from "@/hooks/use-theme";

type DetailItem = {
  icon: IconSvgElement;
  label: string;
  value: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default function AdoptionCandidateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = React.useState(false);
  const {
    data: candidate,
    isLoading,
    error,
  } = useQuery({
    queryKey: adoptionCandidateQueryKeys.detail(id ?? ""),
    queryFn: () => fetchAdoptionCandidate(id ?? ""),
    enabled: Boolean(id),
  });
  const deleteCandidateMutation = useMutation({
    mutationFn: deleteAdoptionCandidate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adoptionCandidateQueryKeys.all,
      });
      router.replace("/private/candidatos");
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
    if (!candidate || deleteCandidateMutation.isPending) {
      return;
    }

    Alert.alert(
      "Excluir candidato",
      `Tem certeza que deseja excluir ${candidate.name}? Esta acao nao pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => deleteCandidateMutation.mutate(candidate.id),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <ScreenScroll contentClassName="flex-1 items-center justify-center gap-2">
        <AppText tone="muted">Carregando candidato...</AppText>
      </ScreenScroll>
    );
  }

  if (error || !candidate) {
    return (
      <ScreenScroll contentClassName="flex-1 items-center justify-center gap-2">
        <AppText variant="subtitle">
          {error instanceof ApiError
            ? error.message
            : "Candidato não encontrado"}
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
        <AdoptionCandidateForm
          mode="edit"
          candidate={candidate}
          onBack={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
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
            disabled={deleteCandidateMutation.isPending}
            onPress={handleDeletePress}
          />
        </View>
      </View>

      <CandidateProfile candidate={candidate} />
    </ScreenScroll>
  );
}

function CandidateProfile({ candidate }: { candidate: ApiAdoptionCandidate }) {
  const details: DetailItem[] = [
    { icon: Contact02Icon, label: "Celular", value: candidate.cellphone },
    {
      icon: Contact02Icon,
      label: "CPF",
      value: candidate.cpf ?? "Não informado",
    },
    {
      icon: Location01Icon,
      label: "Endereço",
      value: candidate.address ?? "Não informado",
    },
    {
      icon: Calendar03Icon,
      label: "Cadastro",
      value: formatDate(candidate.createdAt),
    },
    {
      icon: Calendar03Icon,
      label: "Atualização",
      value: formatDate(candidate.updatedAt),
    },
  ];

  return (
    <View className="gap-3">
      <Surface tone="accentSoft" className="overflow-hidden">
        <View className="items-center gap-4 px-5 pb-5 pt-6">
          <View className="h-[116px] w-[116px] items-center justify-center rounded-full border-[6px] border-app-surface bg-app-surface dark:border-app-surface-dark dark:bg-app-surface-dark">
            <AppIcon icon={UserIcon} size={42} />
          </View>
          <View className="w-full items-center gap-2">
            <AppText variant="subtitle" className="text-center" selectable>
              {candidate.name}
            </AppText>
            <AppText tone="muted" className="text-center" selectable>
              {candidate.cellphone}
            </AppText>
          </View>
        </View>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={Contact02Icon} label="Informações" />
        <View className="gap-2">
          {details.map((detail) => (
            <DetailRow key={detail.label} {...detail} />
          ))}
        </View>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={Note01Icon} label="Observações" />
        <AppText tone="muted" selectable>
          {candidate.observation || "Sem observações."}
        </AppText>
      </Surface>
    </View>
  );
}

function DetailRow({ icon, label, value }: DetailItem) {
  const theme = useTheme();

  return (
    <View className="min-h-[62px] flex-row items-center gap-3 rounded-lg bg-app-background px-3 py-3 dark:bg-app-background-dark">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
        <AppIcon icon={icon} size={22} color={theme.textSecondary} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <AppText variant="small" tone="muted">
          {label}
        </AppText>
        <AppText variant="smallBold" className="leading-5" selectable>
          {value}
        </AppText>
      </View>
    </View>
  );
}

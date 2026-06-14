import { zodResolver } from "@hookform/resolvers/zod";
import {
  Agreement01Icon,
  ArrowLeft01Icon,
  Calendar03Icon,
  FavouriteIcon,
  Note01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, View } from "react-native";
import { useForm } from "react-hook-form";

import { AppText } from "@/components/ui/app-text";
import { PrimaryButton } from "@/components/ui/button";
import { Form, FormSelectField, FormTextField } from "@/components/ui/form";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { ApiError } from "@/lib/api";
import { adoptionCandidateQueryKeys, fetchAdoptionCandidates } from "@/lib/adoption-candidates";
import { type AdoptionFormValues, adoptionFormSchema } from "@/lib/adoption-validation";
import { adoptionQueryKeys, createAdoption } from "@/lib/adoptions";
import { catQueryKeys, fetchResidents } from "@/lib/cats";

type AdoptionFormProps = {
  onBack: () => void;
};

function getTodayInput() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

const defaultValues: AdoptionFormValues = {
  adoptionCandidateId: "",
  catId: "",
  adoptionDate: getTodayInput(),
  observation: "",
};

export function AdoptionForm({ onBack }: AdoptionFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<AdoptionFormValues>({
    resolver: zodResolver(adoptionFormSchema),
    defaultValues,
    mode: "onChange",
  });
  const selectedCandidateId = form.watch("adoptionCandidateId");
  const selectedCatId = form.watch("catId");
  const { data: candidates = [], isLoading: isLoadingCandidates } = useQuery({
    queryKey: adoptionCandidateQueryKeys.all,
    queryFn: fetchAdoptionCandidates,
  });
  const { data: residents = [], isLoading: isLoadingResidents } = useQuery({
    queryKey: catQueryKeys.all,
    queryFn: fetchResidents,
  });
  const createAdoptionMutation = useMutation({
    mutationFn: createAdoption,
    onSuccess: async (adoption) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adoptionQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: catQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: catQueryKeys.detail(adoption.catId),
        }),
      ]);
      Alert.alert("Adoção cadastrada", "O registro foi salvo com sucesso.");
      form.reset(defaultValues);
      router.replace("/private/adocoes");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError || error instanceof Error ? error.message : "Tente novamente.";

      Alert.alert("Falha ao cadastrar", message);
    },
  });

  const candidateOptions = candidates.map((candidate) => ({
    label: candidate.name,
    value: candidate.id,
  }));
  const residentOptions = residents
    .filter((resident) => resident.status !== "Adotado")
    .map((resident) => ({
      label: resident.name,
      value: resident.id,
    }));
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId);
  const selectedResident = residents.find((resident) => resident.id === selectedCatId);
  const isLoading = isLoadingCandidates || isLoadingResidents;
  const isPending = createAdoptionMutation.isPending;

  const handleSubmit = (values: AdoptionFormValues) => {
    createAdoptionMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <View className="flex-row items-start gap-2">
        <Pressable className="w-9 items-center pt-1" onPress={onBack} hitSlop={8}>
          <AppIcon icon={ArrowLeft01Icon} size={24} />
        </Pressable>
        <HeaderBlock
          className="flex-1"
          title="Nova adoção"
          subtitle="Vincule candidato, residente e data do processo"
        />
      </View>

      <Surface tone="accentSoft" className="items-center gap-3 p-5">
        <View className="h-[92px] w-[92px] items-center justify-center rounded-full border-[6px] border-app-surface bg-app-surface dark:border-app-surface-dark dark:bg-app-surface-dark">
          <AppIcon icon={Agreement01Icon} size={34} />
        </View>
        <View className="items-center gap-1">
          <AppText variant="subtitle" className="text-center">
            Registro de adoção
          </AppText>
          <AppText tone="muted" className="text-center">
            Ao salvar, o residente será marcado como adotado
          </AppText>
        </View>
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Agreement01Icon} label="Vínculos" />
        <FormSelectField<AdoptionFormValues, "adoptionCandidateId">
          name="adoptionCandidateId"
          label="Candidato"
          items={candidateOptions}
        />
        <FormSelectField<AdoptionFormValues, "catId">
          name="catId"
          label="Residente"
          items={residentOptions}
        />
        {isLoading ? <AppText tone="muted">Carregando opções...</AppText> : null}
        {!isLoading && candidates.length === 0 ? (
          <AppText tone="danger">Cadastre um candidato antes de registrar uma adoção.</AppText>
        ) : null}
        {!isLoading && residentOptions.length === 0 ? (
          <AppText tone="danger">Não há residentes disponíveis para adoção.</AppText>
        ) : null}
      </Surface>

      {selectedCandidate || selectedResident ? (
        <Surface className="gap-3 p-4">
          <SectionHeader icon={CheckSummaryIcon} label="Resumo" />
          {selectedCandidate ? (
            <SummaryRow
              icon={UserIcon}
              label="Candidato"
              value={`${selectedCandidate.name} · ${selectedCandidate.cellphone}`}
            />
          ) : null}
          {selectedResident ? (
            <SummaryRow
              icon={FavouriteIcon}
              label="Residente"
              value={`${selectedResident.name} · ${selectedResident.status}`}
            />
          ) : null}
        </Surface>
      ) : null}

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Calendar03Icon} label="Data" />
        <FormTextField<AdoptionFormValues, "adoptionDate">
          name="adoptionDate"
          label="Data da adoção"
          placeholder="dd / mm / yyyy"
          keyboardType="number-pad"
        />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Note01Icon} label="Observações" />
        <FormTextField<AdoptionFormValues, "observation">
          name="observation"
          label=""
          placeholder="Termos combinados, adaptação, acompanhamento..."
          multiline
        />
      </Surface>

      <PrimaryButton
        label={isPending ? "Cadastrando..." : "Cadastrar adoção"}
        onPress={form.handleSubmit(handleSubmit)}
        loading={isPending}
        disabled={isPending || isLoading}
      />
    </Form>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-app-background px-3 py-3 dark:bg-app-background-dark">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
        <AppIcon icon={icon} size={22} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <AppText variant="small" tone="muted">
          {label}
        </AppText>
        <AppText variant="smallBold" numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const CheckSummaryIcon = Agreement01Icon;

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Alert, Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import {
  ArrowLeft01Icon,
  Contact02Icon,
  Note01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";

import { AppText } from "@/components/ui/app-text";
import { PrimaryButton } from "@/components/ui/button";
import { Form, FormTextField } from "@/components/ui/form";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import {
  type ApiAdoptionCandidate,
  adoptionCandidateQueryKeys,
  createAdoptionCandidate,
  updateAdoptionCandidate,
} from "@/lib/adoption-candidates";
import {
  type AdoptionCandidateFormValues,
  adoptionCandidateFormSchema,
  formatCellphone,
  formatCpf,
} from "@/lib/adoption-candidate-validation";
import { ApiError } from "@/lib/api";

type AdoptionCandidateFormProps = {
  onBack: () => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  candidate?: ApiAdoptionCandidate;
};

const defaultValues: AdoptionCandidateFormValues = {
  name: "",
  cellphone: "",
  cpf: "",
  address: "",
  observation: "",
};

function valuesFromCandidate(
  candidate?: ApiAdoptionCandidate,
): AdoptionCandidateFormValues {
  if (!candidate) {
    return defaultValues;
  }

  return {
    name: candidate.name,
    cellphone: candidate.cellphone,
    cpf: candidate.cpf ?? "",
    address: candidate.address ?? "",
    observation: candidate.observation ?? "",
  };
}

export function AdoptionCandidateForm({
  onBack,
  onSuccess,
  mode = "create",
  candidate,
}: AdoptionCandidateFormProps) {
  const queryClient = useQueryClient();
  const isEditing = mode === "edit";
  const form = useForm<AdoptionCandidateFormValues>({
    resolver: zodResolver(adoptionCandidateFormSchema),
    defaultValues: valuesFromCandidate(candidate),
    mode: "onChange",
  });
  const createAdoptionCandidateMutation = useMutation({
    mutationFn: createAdoptionCandidate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adoptionCandidateQueryKeys.all,
      });
      Alert.alert(
        "Candidato cadastrado",
        "O candidato à adoção foi salvo com sucesso.",
      );
      form.reset(defaultValues);
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Tente novamente.";

      Alert.alert("Falha ao cadastrar", message);
    },
  });
  const updateAdoptionCandidateMutation = useMutation({
    mutationFn: updateAdoptionCandidate,
    onSuccess: async (updatedCandidate) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adoptionCandidateQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: adoptionCandidateQueryKeys.detail(updatedCandidate.id),
        }),
      ]);
      queryClient.setQueryData(
        adoptionCandidateQueryKeys.detail(updatedCandidate.id),
        updatedCandidate,
      );
      Alert.alert(
        "Candidato atualizado",
        "As alterações foram salvas com sucesso.",
      );
      onSuccess?.();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Tente novamente.";

      Alert.alert("Falha ao atualizar", message);
    },
  });

  const handleSubmit = (values: AdoptionCandidateFormValues) => {
    const payload = {
      name: values.name,
      cellphone: values.cellphone,
      cpf: values.cpf,
      address: values.address ?? "",
      observation: values.observation ?? "",
    };

    if (isEditing && candidate) {
      updateAdoptionCandidateMutation.mutate({
        id: candidate.id,
        ...payload,
      });
      return;
    }

    createAdoptionCandidateMutation.mutate(payload);
  };
  const isPending =
    createAdoptionCandidateMutation.isPending ||
    updateAdoptionCandidateMutation.isPending;

  return (
    <Form {...form}>
      <View className="flex-row items-start gap-2">
        <Pressable
          className="w-9 items-center pt-1"
          onPress={onBack}
          hitSlop={8}
        >
          <AppIcon icon={ArrowLeft01Icon} size={24} />
        </Pressable>
        <HeaderBlock
          className="flex-1"
          title={isEditing ? "Editar Candidato" : "Candidato à adoção"}
          subtitle={
            isEditing
              ? "Atualize os dados da pessoa interessada"
              : "Preencha os dados da pessoa interessada"
          }
        />
      </View>

      <Surface tone="accentSoft" className="items-center gap-3 p-5">
        <View className="h-[92px] w-[92px] items-center justify-center rounded-full border-[6px] border-app-surface bg-app-surface dark:border-app-surface-dark dark:bg-app-surface-dark">
          <AppIcon icon={UserIcon} size={34} />
        </View>
        <View className="items-center gap-1">
          <AppText variant="subtitle" className="text-center">
            Candidato
          </AppText>
          <AppText tone="muted" className="text-center">
            Dados de contato e perfil
          </AppText>
        </View>
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Contact02Icon} label="Informações" />
        <FormTextField<AdoptionCandidateFormValues, "name">
          name="name"
          label="Nome"
          placeholder="Nome do candidato"
        />
        <FormTextField<AdoptionCandidateFormValues, "cellphone">
          name="cellphone"
          label="Celular"
          placeholder="(00) 00000-0000"
          formatValue={formatCellphone}
          keyboardType="phone-pad"
        />
        <FormTextField<AdoptionCandidateFormValues, "cpf">
          name="cpf"
          label="CPF (opcional)"
          placeholder="000.000.000-00"
          formatValue={formatCpf}
          keyboardType="number-pad"
        />
        <FormTextField<AdoptionCandidateFormValues, "address">
          name="address"
          label="Endereço (opcional)"
          placeholder="Rua, número, bairro"
        />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Note01Icon} label="Observações" />
        <FormTextField<AdoptionCandidateFormValues, "observation">
          name="observation"
          label=""
          placeholder="Preferências, disponibilidade, histórico com animais..."
          multiline
        />
      </Surface>

      <PrimaryButton
        label={
          isPending
            ? isEditing
              ? "Salvando..."
              : "Cadastrando..."
            : isEditing
              ? "Salvar Alterações"
              : "Cadastrar Candidato"
        }
        onPress={form.handleSubmit(handleSubmit)}
        loading={isPending}
        disabled={isPending}
      />
    </Form>
  );
}

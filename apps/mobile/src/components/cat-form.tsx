import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft01Icon,
  Calendar03Icon,
  Camera01Icon,
  FileUploadIcon,
  FavouriteIcon,
  ImageAdd01Icon,
  ImageDelete01Icon,
  InformationCircleIcon,
  MedicalFileIcon,
  Note01Icon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, View } from "react-native";
import { useForm } from "react-hook-form";

import { ResidentAvatar } from "@/components/resident-avatar";
import { PrimaryButton } from "@/components/ui/button";
import { Form, FormSelectField, FormTextField, FormToggleField } from "@/components/ui/form";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { type Resident } from "@/data/residents";
import { ApiError } from "@/lib/api";
import {
  type CatFormValues,
  catDefaultValues,
  catFormSchema,
  genderOptions,
  statusOptions,
} from "@/lib/cat-validation";
import { catQueryKeys, createCat, updateCat } from "@/lib/cats";
import { useTheme } from "@/hooks/use-theme";

type CatFormProps = {
  onBack: () => void;
  mode?: "create" | "edit";
  resident?: Resident;
};

function getTodayInput() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function valuesFromResident(resident?: Resident): CatFormValues {
  if (!resident) {
    return {
      ...catDefaultValues,
      entryDate: getTodayInput(),
    };
  }

  return {
    name: resident.name,
    gender: resident.sex,
    status: resident.status,
    coat: resident.coat,
    breed: resident.breed === "Não informado" ? "" : resident.breed,
    weight: resident.weightKg === "Não informado" ? "" : resident.weightKg,
    furTypeId: resident.furTypeId ?? "",
    pictureBase64: resident.pictureBase64 ?? "",
    adoptionTermBase64: resident.adoptionTermBase64 ?? "",
    adoptionTermMimeType: resident.adoptionTermMimeType ?? "",
    medicalExamBase64: resident.medicalExamBase64 ?? "",
    medicalExamMimeType: resident.medicalExamMimeType ?? "",
    entryDate: resident.entryDate === "Não informado" ? "" : resident.entryDate,
    adoptionDate: resident.adoptionDate === "Não informado" ? "" : resident.adoptionDate,
    birthDate: resident.birthDate === "Não informado" ? "" : resident.birthDate,
    neutered: resident.neutered,
    vaccinated: resident.vaccinated,
    fiv: resident.fiv,
    felv: resident.felv,
    notes: resident.notes === "Sem observações." ? "" : resident.notes,
  };
}

export function CatForm({ onBack, mode = "create", resident }: CatFormProps) {
  const queryClient = useQueryClient();
  const isEditing = mode === "edit";
  const form = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: valuesFromResident(resident),
    mode: "onChange",
  });
  const pictureBase64 = form.watch("pictureBase64");
  const adoptionTermBase64 = form.watch("adoptionTermBase64");
  const adoptionTermMimeType = form.watch("adoptionTermMimeType");
  const medicalExamBase64 = form.watch("medicalExamBase64");
  const medicalExamMimeType = form.watch("medicalExamMimeType");
  const watchedName = form.watch("name");
  const createCatMutation = useMutation({
    mutationFn: createCat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catQueryKeys.all });
      Alert.alert("Residente cadastrado", "O residente foi salvo com sucesso.");
      form.reset({ ...catDefaultValues, entryDate: getTodayInput() });
      router.replace("/private/gatos");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError || error instanceof Error ? error.message : "Tente novamente.";

      Alert.alert("Falha ao cadastrar", message);
    },
  });
  const updateCatMutation = useMutation({
    mutationFn: updateCat,
    onSuccess: async (updatedResident) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: catQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: catQueryKeys.detail(updatedResident.id),
        }),
      ]);
      queryClient.setQueryData(catQueryKeys.detail(updatedResident.id), updatedResident);
      Alert.alert("Residente atualizado", "As alterações foram salvas com sucesso.");
      onBack();
    },
    onError: (error) => {
      const message =
        error instanceof ApiError || error instanceof Error ? error.message : "Tente novamente.";

      Alert.alert("Falha ao atualizar", message);
    },
  });

  const handleSubmit = (values: CatFormValues) => {
    const payload = {
      name: values.name,
      gender: values.gender,
      status: values.status,
      coat: values.coat,
      breed: values.breed,
      weight: values.weight,
      furTypeId: values.furTypeId,
      pictureBase64: values.pictureBase64,
      adoptionTermBase64: values.adoptionTermBase64,
      adoptionTermMimeType: values.adoptionTermMimeType,
      medicalExamBase64: values.medicalExamBase64,
      medicalExamMimeType: values.medicalExamMimeType,
      entryDate: values.entryDate,
      adoptionDate: values.adoptionDate,
      birthDate: values.birthDate,
      neutered: values.neutered,
      vaccinated: values.vaccinated,
      fiv: values.fiv,
      felv: values.felv,
      notes: values.notes,
    };

    if (isEditing && resident) {
      updateCatMutation.mutate({
        id: resident.id,
        ...payload,
      });
      return;
    }

    createCatMutation.mutate(payload);
  };
  const isPending = createCatMutation.isPending || updateCatMutation.isPending;
  const profileName = watchedName.trim() || resident?.name || "Residente";

  const setPickedImage = (asset?: ImagePicker.ImagePickerAsset) => {
    if (!asset?.base64) {
      Alert.alert("Foto nao selecionada", "Nao foi possivel ler a imagem escolhida.");
      return;
    }

    form.setValue("pictureBase64", asset.base64, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const selectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso as fotos para selecionar uma imagem.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.78,
      base64: true,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso a camera para tirar uma foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.78,
      base64: true,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0]);
    }
  };

  const removePhoto = () => {
    form.setValue("pictureBase64", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const pickDocument = async (
    base64Field: "adoptionTermBase64" | "medicalExamBase64",
    mimeField: "adoptionTermMimeType" | "medicalExamMimeType",
  ) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const base64 = asset.base64 ?? (await new File(asset.uri).base64());

    form.setValue(base64Field, base64, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(mimeField, asset.mimeType ?? "application/octet-stream", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const takeDocumentPhoto = async (
    base64Field: "adoptionTermBase64" | "medicalExamBase64",
    mimeField: "adoptionTermMimeType" | "medicalExamMimeType",
  ) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso a camera para tirar uma foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.82,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert("Foto nao selecionada", "Nao foi possivel ler a foto tirada.");
      return;
    }

    form.setValue(base64Field, asset.base64, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(mimeField, asset.mimeType ?? "image/jpeg", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeDocument = (
    base64Field: "adoptionTermBase64" | "medicalExamBase64",
    mimeField: "adoptionTermMimeType" | "medicalExamMimeType",
  ) => {
    form.setValue(base64Field, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(mimeField, "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Form {...form}>
      <View className="flex-row items-start gap-2">
        <Pressable className="w-9 items-center pt-1" onPress={onBack} hitSlop={8}>
          <AppIcon icon={ArrowLeft01Icon} size={24} />
        </Pressable>
        <HeaderBlock
          className="flex-1"
          title={isEditing ? "Editar Residente" : "Novo Residente"}
          subtitle={
            isEditing
              ? "Atualize as informações do residente"
              : "Preencha as informações do novo residente"
          }
        />
      </View>

      <Surface tone="accentSoft" className="overflow-hidden">
        <View className="items-center gap-4 px-5 pb-5 pt-6">
          <View className="rounded-full border-[6px] border-app-surface bg-app-surface p-1 dark:border-app-surface-dark dark:bg-app-surface-dark">
            <ResidentAvatar name={profileName} pictureBase64={pictureBase64} size="hero" />
          </View>
          <View className="items-center gap-1">
            <AppText variant="subtitle" className="text-center">
              {profileName}
            </AppText>
            <AppText tone="muted" className="text-center">
              Foto do residente
            </AppText>
          </View>
        </View>

        <View className="border-t border-app-border/70 bg-app-surface/70 px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark/70">
          <View className="flex-row gap-2">
            <PhotoAction icon={ImageAdd01Icon} label="Galeria" onPress={selectPhoto} />
            <PhotoAction icon={Camera01Icon} label="Camera" onPress={takePhoto} />
            {pictureBase64 ? (
              <PhotoAction
                icon={ImageDelete01Icon}
                label="Remover"
                tone="danger"
                onPress={removePhoto}
              />
            ) : null}
          </View>
        </View>
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={InformationCircleIcon} label="Informações" />
        <FormTextField<CatFormValues, "name"> name="name" label="Nome" placeholder="Nome do gato" />
        <View className="flex-row gap-4">
          <FormSelectField<CatFormValues, "gender">
            name="gender"
            label="Gênero"
            items={[...genderOptions]}
            className="flex-1"
          />
          <FormSelectField<CatFormValues, "status">
            name="status"
            label="Status"
            items={[...statusOptions]}
            className="flex-1"
          />
        </View>
        <FormTextField<CatFormValues, "coat">
          name="coat"
          label="Cor / Pelagem"
          placeholder="Ex: Preta e branca, Caramelo..."
        />
        <View className="flex-row gap-4">
          <FormTextField<CatFormValues, "breed">
            name="breed"
            label="Raça (opcional)"
            placeholder="Ex: SRD, Persa..."
            className="flex-1"
          />
          <FormTextField<CatFormValues, "weight">
            name="weight"
            label="Peso em kg (opcional)"
            placeholder="Ex: 4.5"
            keyboardType="number-pad"
            className="flex-1"
          />
        </View>
        <FormTextField<CatFormValues, "furTypeId">
          name="furTypeId"
          label="ID do Tipo de Pelagem (opcional)"
          placeholder="UUID do tipo de pelagem"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Calendar03Icon} label="Datas" />
        <View className="flex-row gap-4">
          <FormTextField<CatFormValues, "entryDate">
            name="entryDate"
            label="Data de Entrada"
            placeholder="dd / mm / yyyy"
            editable={false}
            className="flex-1"
          />
          <FormTextField<CatFormValues, "birthDate">
            name="birthDate"
            label="Nascimento (opcional)"
            placeholder="dd / mm / yyyy"
            className="flex-1"
          />
        </View>
        <FormTextField<CatFormValues, "adoptionDate">
          name="adoptionDate"
          label="Data de Adoção (opcional)"
          placeholder="dd / mm / yyyy"
        />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={FavouriteIcon} label="Saúde" />
        <FormToggleField<CatFormValues, "neutered"> name="neutered" label="Castrado(a)" />
        <FormToggleField<CatFormValues, "vaccinated"> name="vaccinated" label="Vacinado(a)" />
        <FormToggleField<CatFormValues, "fiv"> name="fiv" label="FIV" />
        <FormToggleField<CatFormValues, "felv"> name="felv" label="FeLV" />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={FileUploadIcon} label="Documentos" />
        <DocumentAction
          icon={FileUploadIcon}
          label="Termo de Adoção"
          mimeType={adoptionTermMimeType}
          hasFile={Boolean(adoptionTermBase64)}
          onSelect={() => pickDocument("adoptionTermBase64", "adoptionTermMimeType")}
          onTakePhoto={() => takeDocumentPhoto("adoptionTermBase64", "adoptionTermMimeType")}
          onRemove={() => removeDocument("adoptionTermBase64", "adoptionTermMimeType")}
        />
        <DocumentAction
          icon={MedicalFileIcon}
          label="Exame Médico"
          mimeType={medicalExamMimeType}
          hasFile={Boolean(medicalExamBase64)}
          onSelect={() => pickDocument("medicalExamBase64", "medicalExamMimeType")}
          onTakePhoto={() => takeDocumentPhoto("medicalExamBase64", "medicalExamMimeType")}
          onRemove={() => removeDocument("medicalExamBase64", "medicalExamMimeType")}
        />
      </Surface>

      <Surface className="gap-4 p-4">
        <SectionHeader icon={Note01Icon} label="Observações" />
        <FormTextField<CatFormValues, "notes">
          name="notes"
          label=""
          placeholder="Histórico médico, comportamento, informações adicionais..."
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
              : "Cadastrar Residente"
        }
        onPress={form.handleSubmit(handleSubmit)}
        loading={isPending}
        disabled={isPending}
      />
    </Form>
  );
}

function DocumentAction({
  icon,
  label,
  mimeType,
  hasFile,
  onSelect,
  onTakePhoto,
  onRemove,
}: {
  icon: IconSvgElement;
  label: string;
  mimeType: string;
  hasFile: boolean;
  onSelect: () => void;
  onTakePhoto: () => void;
  onRemove: () => void;
}) {
  const theme = useTheme();

  return (
    <View className="gap-2 rounded-lg bg-app-background p-3 dark:bg-app-background-dark">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark">
          <AppIcon icon={icon} size={22} color={theme.textSecondary} />
        </View>
        <View className="min-w-0 flex-1">
          <AppText variant="smallBold">{label}</AppText>
          <AppText variant="small" tone="muted" numberOfLines={1}>
            {hasFile ? mimeType || "Arquivo selecionado" : "PDF ou imagem"}
          </AppText>
        </View>
      </View>
      <View className="flex-row gap-2">
        <PhotoAction
          icon={FileUploadIcon}
          label={hasFile ? "Trocar" : "Selecionar"}
          onPress={onSelect}
        />
        <PhotoAction icon={Camera01Icon} label="Camera" onPress={onTakePhoto} />
        {hasFile ? (
          <PhotoAction icon={ImageDelete01Icon} label="Remover" tone="danger" onPress={onRemove} />
        ) : null}
      </View>
    </View>
  );
}

function PhotoAction({
  icon,
  label,
  tone = "default",
  onPress,
}: {
  icon: IconSvgElement;
  label: string;
  tone?: "default" | "danger";
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 dark:border-app-border-dark dark:bg-app-surface-dark"
      onPress={onPress}
    >
      <AppIcon icon={icon} size={20} color={tone === "danger" ? "#E11D48" : theme.textSecondary} />
      <AppText
        variant="smallBold"
        className={tone === "danger" ? "text-app-danger" : ""}
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

import {
  Add01Icon,
  Agreement01Icon,
  ArrowLeft01Icon,
  CheckListIcon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import { type IconSvgElement } from "@hugeicons/react-native";
import { useQuery } from "@tanstack/react-query";
import { router, type Href } from "expo-router";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { AdoptionCandidateForm } from "@/components/adoption-candidate";
import { CatForm } from "@/components/cat-form";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { Surface } from "@/components/ui/surface";
import { UserForm } from "@/components/user-form";
import { adminRolesQueryKey, listAdminRoles } from "@/lib/admin";
import { appPermissions, useCurrentPermissions } from "@/lib/permissions";

type RegisterType = "user" | "cat" | "adoptionCandidate" | "adoption";

const newAdoptionHref = "/private/adocao/nova" as Href;

const registerOptions: {
  type: RegisterType;
  title: string;
  description: string;
  icon: IconSvgElement;
}[] = [
  {
    type: "user",
    title: "Novo usuário",
    description: "Adicionar uma pessoa com acesso ao sistema.",
    icon: Add01Icon,
  },
  {
    type: "cat",
    title: "Gato",
    description: "Cadastrar um novo residente do santuário.",
    icon: FavouriteIcon,
  },
  {
    type: "adoptionCandidate",
    title: "Candidato à adoção",
    description: "Registrar uma pessoa interessada em adotar.",
    icon: CheckListIcon,
  },
  {
    type: "adoption",
    title: "Adoção",
    description: "Criar um registro vinculando candidato e residente.",
    icon: Agreement01Icon,
  },
];

export default function RegisterScreen() {
  const [selectedType, setSelectedType] = useState<RegisterType | null>(null);
  const permissions = useCurrentPermissions();
  const { data: roles = [] } = useQuery({
    queryKey: adminRolesQueryKey,
    queryFn: listAdminRoles,
    enabled: selectedType === "user" && permissions.canCreateUsers,
  });
  const roleItems = roles.map((role) => ({
    label: role.name,
    value: role.slug,
    description: role.description,
  }));

  const handleBack = () => {
    if (selectedType) {
      setSelectedType(null);
      return;
    }

    router.back();
  };

  const visibleRegisterOptions = registerOptions.filter((option) => {
    if (option.type === "user") {
      return permissions.has(appPermissions.usersCreate);
    }

    if (option.type === "cat") {
      return permissions.has(appPermissions.catsManage);
    }

    if (option.type === "adoptionCandidate") {
      return permissions.has(appPermissions.adoptionCandidatesManage);
    }

    return permissions.has(appPermissions.adoptionsManage);
  });

  const renderChooser = () => (
    <>
      <View className="flex-row items-start gap-2">
        <Pressable className="w-9 items-center pt-1" onPress={handleBack} hitSlop={8}>
          <AppIcon icon={ArrowLeft01Icon} size={24} />
        </Pressable>
        <HeaderBlock
          className="flex-1"
          title="Cadastrar"
          subtitle="Escolha o tipo de cadastro que deseja iniciar"
        />
      </View>

      <Surface tone="accentSoft" className="gap-3 p-5">
        <View className="h-14 w-14 items-center justify-center rounded-full border-[6px] border-app-surface bg-app-surface dark:border-app-surface-dark dark:bg-app-surface-dark">
          <AppIcon icon={Add01Icon} size={24} />
        </View>
        <View className="gap-1">
          <AppText variant="subtitle">Novo Cadastro</AppText>
          <AppText tone="muted">Selecione uma categoria para continuar</AppText>
        </View>
      </Surface>

      <View className="gap-3">
        {visibleRegisterOptions.length === 0 ? (
          <Surface className="p-4">
            <AppText tone="muted">Você não tem permissões para criar registros.</AppText>
          </Surface>
        ) : (
          visibleRegisterOptions.map((option) => (
            <Pressable
              key={option.type}
              onPress={() => {
                if (option.type === "adoption") {
                  router.push(newAdoptionHref);
                  return;
                }

                setSelectedType(option.type);
              }}
            >
              <Surface className="min-h-[104px] flex-row items-center gap-4 p-4">
                <View className="h-12 w-12 items-center justify-center rounded-lg bg-app-accent-soft dark:bg-app-accent-soft-dark">
                  <AppIcon icon={option.icon} size={24} />
                </View>
                <View className="flex-1 gap-1">
                  <AppText className="text-lg font-bold leading-6">{option.title}</AppText>
                  <AppText tone="muted">{option.description}</AppText>
                </View>
              </Surface>
            </Pressable>
          ))
        )}
      </View>
    </>
  );

  return (
    <ScreenScroll contentClassName="gap-3 pb-28 pt-3">
      {!selectedType ? renderChooser() : null}
      {selectedType === "cat" && permissions.canManageCats ? <CatForm onBack={handleBack} /> : null}
      {selectedType === "adoptionCandidate" && permissions.canManageAdoptionCandidates ? (
        <AdoptionCandidateForm onBack={handleBack} onSuccess={() => setSelectedType(null)} />
      ) : null}
      {selectedType === "user" && permissions.canCreateUsers ? (
        <UserForm roles={roleItems} onBack={handleBack} />
      ) : null}
    </ScreenScroll>
  );
}

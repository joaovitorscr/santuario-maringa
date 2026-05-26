import { ArrowLeft01Icon, UserIcon } from "@hugeicons/core-free-icons";
import React from "react";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { PrimaryButton } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";

type UserFormProps = {
  onBack: () => void;
};

export function UserForm({ onBack }: UserFormProps) {
  return (
    <>
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
          title="Novo usuário"
          subtitle="Cadastro de usuários será configurado nesta etapa"
        />
      </View>

      <Surface tone="accentSoft" className="items-center gap-3 p-5">
        <View className="h-[92px] w-[92px] items-center justify-center rounded-full border-[6px] border-app-surface bg-app-surface dark:border-app-surface-dark dark:bg-app-surface-dark">
          <AppIcon icon={UserIcon} size={34} />
        </View>
        <AppText variant="subtitle" className="text-center">
          Novo usuário
        </AppText>
      </Surface>

      <Surface className="gap-3 p-4">
        <SectionHeader icon={UserIcon} label="Usuário" />
        <AppText tone="muted">
          O tipo de cadastro já está disponível na tela inicial. O formulário de
          usuário precisa ser conectado a uma criação administrativa para não
          trocar a sessão atual.
        </AppText>
      </Surface>

      <PrimaryButton label="Voltar às opções" onPress={onBack} />
    </>
  );
}

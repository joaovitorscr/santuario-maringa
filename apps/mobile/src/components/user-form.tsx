import { ArrowLeft01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Alert, Pressable, View } from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AppText } from "@/components/ui/app-text";
import { PrimaryButton } from "@/components/ui/button";
import { Form, FormSelectField, FormTextField } from "@/components/ui/form";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/lib/auth-client";

type UserFormProps = {
  onBack: () => void;
  onSuccess?: () => void;
  roles: {
    label: string;
    value: string;
    description?: string | null;
  }[];
};

const userFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome."),
  username: z
    .string()
    .trim()
    .min(3, "Use pelo menos 3 caracteres.")
    .max(30, "Use no máximo 30 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e sublinhado."),
  email: z.string().trim().email("Informe um email válido."),
  password: z.string().min(8, "Use pelo menos 8 caracteres."),
  role: z.string().trim().min(1, "Selecione uma função."),
});

type UserFormValues = z.infer<typeof userFormSchema>;

function getAdminErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);

    if (message) {
      return message;
    }
  }

  return "Não foi possível criar o usuário.";
}

export function UserForm({ onBack, onSuccess, roles }: UserFormProps) {
  const roleItems = roles.length
    ? roles
    : [
        {
          label: "Voluntário",
          value: "volunteer",
          description: "Acesso operacional do app.",
        },
      ];
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "volunteer",
    },
    mode: "onChange",
  });

  const selectedRole = roles.find(
    (role) => role.value === userForm.watch("role"),
  );

  const handleSubmit = async (values: UserFormValues) => {
    const { error } = await authClient.admin.createUser({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role as never,
      data: {
        username: values.username,
        displayUsername: values.username,
      },
    });

    if (error) {
      Alert.alert("Falha ao criar usuário", getAdminErrorMessage(error));
      return;
    }

    Alert.alert("Usuário criado", "O usuário já pode acessar o aplicativo.");
    userForm.reset();
    onSuccess?.();
  };

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
          subtitle="Crie uma conta administrativa sem alterar sua sessão atual"
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
        <Form {...userForm}>
          <View className="gap-4">
            <FormTextField<UserFormValues, "name">
              name="name"
              label="Nome"
              placeholder="Nome completo"
              autoCapitalize="words"
              textContentType="name"
            />
            <FormTextField<UserFormValues, "email">
              name="email"
              label="Email"
              placeholder="email@santuario.org"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <FormTextField<UserFormValues, "username">
              name="username"
              label="Usuário de login"
              placeholder="ex: maria_santuario"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              formatValue={(value) => value.replace(/\s+/g, "_").toLowerCase()}
            />
            <FormTextField<UserFormValues, "password">
              name="password"
              label="Senha temporária"
              placeholder="Mínimo de 8 caracteres"
              secureTextEntry
              revealable
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
            <FormSelectField<UserFormValues, "role">
              name="role"
              label="Função"
              items={roleItems}
            />
            {selectedRole ? (
              <AppText tone="muted">{selectedRole.description}</AppText>
            ) : null}
          </View>
        </Form>
      </Surface>

      <PrimaryButton
        label="Criar usuário"
        onPress={userForm.handleSubmit(handleSubmit)}
        loading={userForm.formState.isSubmitting}
      />
    </>
  );
}

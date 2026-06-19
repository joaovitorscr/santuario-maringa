import {
  Add01Icon,
  Cancel01Icon,
  Delete02Icon,
  Edit02Icon,
  Mail01Icon,
  RefreshIcon,
  Search01Icon,
  ShieldBanIcon,
  Tick02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { UserForm } from "@/components/user-form";
import { AppText } from "@/components/ui/app-text";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import {
  adminRolesQueryKey,
  deleteAdminUser,
  listAdminRoles,
} from "@/lib/admin";
import { type ApiAdminRole } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { useTheme } from "@/hooks/use-theme";

type AdminView = "users" | "roles";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned?: boolean | null;
};

type UserDraft = {
  name: string;
  email: string;
};

const adminUsersQueryKey = ["admin", "users"] as const;

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getAdminErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);

    if (message) {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível concluir a ação administrativa.";
}

function getPrimaryRole(role?: string) {
  return role?.split(",")[0]?.trim() || "volunteer";
}

function getRoleLabel(roles: ApiAdminRole[], role?: string) {
  const primaryRole = getPrimaryRole(role);

  return roles.find((item) => item.slug === primaryRole)?.name ?? primaryRole;
}

async function fetchAdminUsers() {
  const { data, error } = await authClient.admin.listUsers({
    query: {
      limit: 100,
      sortBy: "name",
      sortDirection: "asc",
    },
  });

  if (error) {
    throw new Error(getAdminErrorMessage(error));
  }

  return (data?.users ?? []) as AdminUser[];
}

export default function UsersAdminScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<AdminView>("users");
  const [query, setQuery] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userDraft, setUserDraft] = useState<UserDraft>({
    name: "",
    email: "",
  });

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: fetchAdminUsers,
  });
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: adminRolesQueryKey,
    queryFn: listAdminRoles,
  });

  const roleItems = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: role.slug,
        description: role.description,
      })),
    [roles],
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        getRoleLabel(roles, user.role).toLowerCase().includes(normalizedQuery),
    );
  }, [query, roles, users]);

  const setRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await authClient.admin.setRole({
        userId,
        role: role as never,
      });

      if (error) {
        throw new Error(getAdminErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });
    },
    onError: (mutationError) => {
      Alert.alert(
        "Falha ao alterar função",
        getAdminErrorMessage(mutationError),
      );
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UserDraft;
    }) => {
      const { error } = await authClient.admin.updateUser({
        userId,
        data,
      } as never);

      if (error) {
        throw new Error(getAdminErrorMessage(error));
      }
    },
    onSuccess: () => {
      setEditingUserId(null);
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
    onError: (mutationError) => {
      Alert.alert(
        "Falha ao editar usuário",
        getAdminErrorMessage(mutationError),
      );
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });
    },
    onError: (mutationError) => {
      Alert.alert(
        "Falha ao remover usuário",
        getAdminErrorMessage(mutationError),
      );
    },
  });

  const startEditingUser = (user: AdminUser) => {
    setEditingUserId(user.id);
    setUserDraft({
      name: user.name,
      email: user.email,
    });
  };

  const confirmDeleteUser = (user: AdminUser) => {
    Alert.alert(
      "Remover usuário",
      `Remover ${user.name || user.email}? Essa ação exclui a conta se não houver registros vinculados.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => deleteUserMutation.mutate(user.id),
        },
      ],
    );
  };

  if (isCreatingUser) {
    return (
      <ScreenScroll contentClassName="gap-3 pb-28 pt-3">
        <UserForm
          roles={roleItems}
          onBack={() => setIsCreatingUser(false)}
          onSuccess={() => {
            setIsCreatingUser(false);
            queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
            queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });
          }}
        />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll>
      <View className="gap-4">
        <View className="flex-row items-start justify-between gap-3">
          <HeaderBlock
            className="flex-1"
            title="Usuários"
            subtitle="Gerencie contas, funções e permissões do aplicativo"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Criar usuário"
            onPress={() => setIsCreatingUser(true)}
            className="h-12 w-12 items-center justify-center rounded-lg bg-app-accent dark:bg-app-accent-dark"
          >
            <AppIcon icon={Add01Icon} size={24} color="#17201A" />
          </Pressable>
        </View>

        <Surface className="flex-row gap-2 p-2">
          {(
            [
              { value: "users", label: "Usuários", icon: UserGroupIcon },
              { value: "roles", label: "Funções", icon: ShieldBanIcon },
            ] as const
          ).map((item) => {
            const isActive = activeView === item.value;

            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                onPress={() => setActiveView(item.value)}
                className={cn(
                  "min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg",
                  isActive && "bg-app-accent-soft dark:bg-app-accent-soft-dark",
                )}
              >
                <AppIcon
                  icon={item.icon}
                  size={18}
                  color={isActive ? theme.text : theme.textSecondary}
                />
                <AppText className="font-bold">{item.label}</AppText>
              </Pressable>
            );
          })}
        </Surface>
      </View>

      {activeView === "users" ? (
        <Surface className="overflow-hidden">
          <View className="flex-row items-center gap-2 border-b border-app-border px-4 py-3.5 dark:border-app-border-dark">
            <AppIcon
              icon={Search01Icon}
              size={18}
              color={theme.textSecondary}
            />
            <TextInput
              placeholder="Buscar usuário..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              className="flex-1 text-base font-medium text-app-text dark:text-app-text-dark"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Atualizar usuários"
              onPress={() => refetch()}
              disabled={isFetching}
              className="h-9 w-9 items-center justify-center"
            >
              {isFetching ? (
                <ActivityIndicator size="small" color={theme.textSecondary} />
              ) : (
                <AppIcon
                  icon={RefreshIcon}
                  size={20}
                  color={theme.textSecondary}
                />
              )}
            </Pressable>
          </View>

          {isLoading || isLoadingRoles ? (
            <View className="px-4 py-6">
              <AppText tone="muted">Carregando usuários...</AppText>
            </View>
          ) : error ? (
            <View className="gap-3 px-4 py-6">
              <AppText tone="danger" selectable>
                {getAdminErrorMessage(error)}
              </AppText>
              <AppText tone="muted">
                Apenas usuários com permissão administrativa podem listar
                contas.
              </AppText>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View className="px-4 py-6">
              <AppText tone="muted">Nenhum usuário encontrado.</AppText>
            </View>
          ) : (
            filteredUsers.map((user, index) => {
              const primaryRole = getPrimaryRole(user.role);
              const isEditingUser = editingUserId === user.id;
              const isMutatingUser =
                (setRoleMutation.variables?.userId === user.id &&
                  setRoleMutation.isPending) ||
                (deleteUserMutation.variables === user.id &&
                  deleteUserMutation.isPending) ||
                (updateUserMutation.variables?.userId === user.id &&
                  updateUserMutation.isPending);

              return (
                <View
                  key={user.id}
                  className={cn(
                    "gap-3 px-4 py-4",
                    index < filteredUsers.length - 1 &&
                      "border-b border-app-border dark:border-app-border-dark",
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-full bg-app-accent-soft dark:bg-app-accent-soft-dark">
                      <AppText className="font-extrabold text-app-accent dark:text-app-accent-dark">
                        {getInitials(user.name || user.email)}
                      </AppText>
                    </View>

                    <View className="min-w-0 flex-1">
                      <AppText
                        className="font-bold"
                        numberOfLines={1}
                        selectable
                      >
                        {user.name || "Sem nome"}
                      </AppText>
                      <View className="flex-row items-center gap-1.5">
                        <AppIcon
                          icon={Mail01Icon}
                          size={14}
                          color={theme.textSecondary}
                        />
                        <AppText tone="muted" numberOfLines={1} selectable>
                          {user.email}
                        </AppText>
                      </View>
                    </View>

                    <View
                      className={cn(
                        "rounded-lg px-2.5 py-1",
                        user.banned
                          ? "bg-app-border dark:bg-app-border-dark"
                          : "bg-app-success-soft dark:bg-app-success-soft-dark",
                      )}
                    >
                      <AppText
                        variant="smallBold"
                        className={cn(
                          "leading-4",
                          user.banned
                            ? "text-app-muted dark:text-app-muted-dark"
                            : "text-app-success-text dark:text-app-success-text-dark",
                        )}
                      >
                        {user.banned ? "Bloqueado" : "Ativo"}
                      </AppText>
                    </View>
                  </View>

                  {isEditingUser ? (
                    <View className="gap-3 pl-14">
                      <TextField
                        label="Nome"
                        value={userDraft.name}
                        onChangeText={(value) =>
                          setUserDraft((current) => ({
                            ...current,
                            name: value,
                          }))
                        }
                      />
                      <TextField
                        label="Email"
                        value={userDraft.email}
                        onChangeText={(value) =>
                          setUserDraft((current) => ({
                            ...current,
                            email: value,
                          }))
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                      />
                      <View className="flex-row gap-2">
                        <Pressable
                          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-app-accent dark:bg-app-accent-dark"
                          onPress={() =>
                            updateUserMutation.mutate({
                              userId: user.id,
                              data: userDraft,
                            })
                          }
                          disabled={updateUserMutation.isPending}
                        >
                          <AppIcon
                            icon={Tick02Icon}
                            size={18}
                            color="#17201A"
                          />
                          <AppText className="font-bold text-app-text">
                            Salvar
                          </AppText>
                        </Pressable>
                        <Pressable
                          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-app-background dark:bg-app-background-dark"
                          onPress={() => setEditingUserId(null)}
                        >
                          <AppIcon icon={Cancel01Icon} size={18} />
                          <AppText className="font-bold">Cancelar</AppText>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View className="gap-3 pl-14">
                      <SelectField
                        label="Função"
                        value={primaryRole}
                        onValueChange={(role) =>
                          setRoleMutation.mutate({
                            userId: user.id,
                            role,
                          })
                        }
                        items={roleItems}
                      />
                      <View className="flex-row gap-2">
                        <Pressable
                          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-app-background dark:bg-app-background-dark"
                          onPress={() => startEditingUser(user)}
                        >
                          <AppIcon icon={Edit02Icon} size={18} />
                          <AppText className="font-bold">Editar</AppText>
                        </Pressable>
                        <Pressable
                          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-app-background dark:bg-app-background-dark"
                          onPress={() => confirmDeleteUser(user)}
                        >
                          <AppIcon
                            icon={Delete02Icon}
                            size={18}
                            color="#E11D48"
                          />
                          <AppText className="font-bold text-app-danger dark:text-app-danger-dark">
                            Remover
                          </AppText>
                        </Pressable>
                      </View>
                      {isMutatingUser ? (
                        <AppText variant="small" tone="muted">
                          Salvando alteração...
                        </AppText>
                      ) : null}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </Surface>
      ) : (
        <View className="gap-3">
          <View className="flex-row items-center justify-between gap-3">
            <SectionHeader icon={ShieldBanIcon} label="Funções" />
            <Link href="/private/funcao/nova" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Criar função"
                className="h-10 w-10 items-center justify-center rounded-lg bg-app-accent dark:bg-app-accent-dark"
              >
                <AppIcon icon={Add01Icon} size={20} color="#17201A" />
              </Pressable>
            </Link>
          </View>

          {isLoadingRoles ? (
            <Surface className="p-4">
              <AppText tone="muted">Carregando funções...</AppText>
            </Surface>
          ) : roles.length === 0 ? (
            <Surface className="p-4">
              <AppText tone="muted">Nenhuma função criada.</AppText>
            </Surface>
          ) : (
            roles.map((role) => (
              <Link key={role.id} href={`/private/funcao/${role.id}`} asChild>
                <Pressable accessibilityRole="button">
                  <Surface className="gap-2 p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="min-w-0 flex-1 gap-1">
                        <View className="flex-row flex-wrap items-center gap-2">
                          <AppText className="text-lg font-bold leading-6">
                            {role.name}
                          </AppText>
                          {role.isSystem ? (
                            <View className="rounded-md bg-app-accent-soft px-2 py-0.5 dark:bg-app-accent-soft-dark">
                              <AppText variant="smallBold">Sistema</AppText>
                            </View>
                          ) : null}
                        </View>
                        <AppText tone="muted">
                          {role.description || role.slug}
                        </AppText>
                      </View>
                      <View className="rounded-lg bg-app-accent-soft px-2.5 py-1.5 dark:bg-app-accent-soft-dark">
                        <AppText variant="smallBold">{role.userCount}</AppText>
                      </View>
                    </View>
                  </Surface>
                </Pressable>
              </Link>
            ))
          )}
        </View>
      )}
    </ScreenScroll>
  );
}

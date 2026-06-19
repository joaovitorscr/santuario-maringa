import {
  ArrowLeft01Icon,
  CheckListIcon,
  Delete02Icon,
  ShieldBanIcon,
  Tick02Icon,
  UserAdd01Icon,
  UserGroupIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/app-text";
import { PrimaryButton } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/form-fields";
import { AppIcon } from "@/components/ui/icon";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { SectionHeader } from "@/components/ui/section-header";
import { Surface } from "@/components/ui/surface";
import {
  adminPermissionsQueryKey,
  adminRolesQueryKey,
  createAdminRole,
  deleteAdminRole,
  listAdminPermissions,
  listAdminRoles,
  updateAdminRole,
  type AdminRolePayload,
} from "@/lib/admin";
import { type ApiAdminPermission, type ApiAdminRole } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  banned?: boolean | null;
};

const adminUsersQueryKey = ["admin", "users"] as const;

const emptyRoleDraft: AdminRolePayload = {
  name: "",
  description: "",
  permissionKeys: [],
};

const permissionCategoryLabels: Record<string, string> = {
  users: "Usuários",
  roles: "Funções",
  cats: "Gatos",
  adoptions: "Adoções",
  adoption_candidates: "Candidatos",
};

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

function toRoleDraft(role: ApiAdminRole): AdminRolePayload {
  return {
    name: role.name,
    description: role.description ?? "",
    permissionKeys: role.permissions.map((permission) => permission.key),
  };
}

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getPermissionCategory(permissionKey: string) {
  return permissionKey.split(".")[0]?.trim() || "app";
}

async function fetchAdminUsers() {
  const { data, error } = await authClient.admin.listUsers({
    query: {
      limit: 200,
      sortBy: "name",
      sortDirection: "asc",
    },
  });

  if (error) {
    throw new Error(getAdminErrorMessage(error));
  }

  return (data?.users ?? []) as AdminUser[];
}

function PermissionToggle({
  permission,
  enabled,
  onToggle,
}: {
  permission: ApiAdminPermission;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: enabled }}
      onPress={onToggle}
      className="min-h-[48px] flex-row items-center gap-3 rounded-lg bg-app-background px-3 dark:bg-app-background-dark"
    >
      <View
        className={cn(
          "h-6 w-6 items-center justify-center rounded-md border",
          enabled
            ? "border-app-accent bg-app-accent dark:border-app-accent-dark dark:bg-app-accent-dark"
            : "border-app-border dark:border-app-border-dark",
        )}
      >
        {enabled ? (
          <AppIcon icon={Tick02Icon} size={14} color="#17201A" />
        ) : null}
      </View>
      <View className="min-w-0 flex-1">
        <AppText className="font-bold" numberOfLines={1}>
          {permission.label}
        </AppText>
        <AppText variant="small" tone="muted" numberOfLines={1}>
          {permission.key}
        </AppText>
      </View>
    </Pressable>
  );
}

export default function RoleDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const roleId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isCreatingRole = roleId === "nova";
  const queryClient = useQueryClient();
  const [roleDraft, setRoleDraft] = useState<AdminRolePayload>(emptyRoleDraft);
  const [selectedUserId, setSelectedUserId] = useState("");

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: adminRolesQueryKey,
    queryFn: listAdminRoles,
  });
  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery({
    queryKey: adminPermissionsQueryKey,
    queryFn: listAdminPermissions,
  });
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: fetchAdminUsers,
  });

  const role = roles.find((item) => item.id === roleId);
  const currentRoleSlug = isCreatingRole ? undefined : role?.slug;
  const memberUsers = useMemo(
    () => users.filter((user) => getPrimaryRole(user.role) === currentRoleSlug),
    [currentRoleSlug, users],
  );
  const availableUsers = useMemo(
    () => users.filter((user) => getPrimaryRole(user.role) !== currentRoleSlug),
    [currentRoleSlug, users],
  );
  const fallbackRole = useMemo(() => {
    if (
      currentRoleSlug !== "volunteer" &&
      roles.some((item) => item.slug === "volunteer")
    ) {
      return "volunteer";
    }

    return roles.find((item) => item.slug !== currentRoleSlug)?.slug ?? "user";
  }, [currentRoleSlug, roles]);
  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, ApiAdminPermission[]>();

    for (const permission of permissions) {
      const category = getPermissionCategory(permission.key);
      groups.set(category, [...(groups.get(category) ?? []), permission]);
    }

    return Array.from(groups.entries())
      .map(([category, items]) => ({
        category,
        label: permissionCategoryLabels[category] ?? category,
        permissions: items.sort((left, right) =>
          left.label.localeCompare(right.label),
        ),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissions]);

  useEffect(() => {
    if (isCreatingRole) {
      setRoleDraft(emptyRoleDraft);
      return;
    }

    if (role) {
      setRoleDraft(toRoleDraft(role));
    }
  }, [isCreatingRole, role]);

  useEffect(() => {
    setSelectedUserId(availableUsers[0]?.id ?? "");
  }, [availableUsers]);

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      if (isCreatingRole) {
        return createAdminRole(roleDraft);
      }

      if (!role) {
        throw new Error("Função não encontrada.");
      }

      return updateAdminRole(role.id, roleDraft);
    },
    onSuccess: (savedRole) => {
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });

      if (isCreatingRole) {
        router.replace(`/private/funcao/${savedRole.id}`);
      }
    },
    onError: (mutationError) => {
      Alert.alert(
        "Falha ao salvar função",
        getAdminErrorMessage(mutationError),
      );
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async () => {
      if (!role) {
        throw new Error("Função não encontrada.");
      }

      return deleteAdminRole(role.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminRolesQueryKey });
      router.back();
    },
    onError: (mutationError) => {
      Alert.alert(
        "Falha ao remover função",
        getAdminErrorMessage(mutationError),
      );
    },
  });

  const setRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      nextRole,
    }: {
      userId: string;
      nextRole: string;
    }) => {
      const { error } = await authClient.admin.setRole({
        userId,
        role: nextRole as never,
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
        "Falha ao alterar membro",
        getAdminErrorMessage(mutationError),
      );
    },
  });

  const toggleDraftPermission = (permissionKey: string) => {
    setRoleDraft((current) => ({
      ...current,
      permissionKeys: current.permissionKeys.includes(permissionKey)
        ? current.permissionKeys.filter((key) => key !== permissionKey)
        : [...current.permissionKeys, permissionKey],
    }));
  };

  const confirmDeleteRole = () => {
    if (!role) {
      return;
    }

    Alert.alert("Remover função", `Remover a função ${role.name}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => deleteRoleMutation.mutate(),
      },
    ]);
  };

  const addSelectedUser = () => {
    if (!selectedUserId || !currentRoleSlug) {
      return;
    }

    setRoleMutation.mutate({
      userId: selectedUserId,
      nextRole: currentRoleSlug,
    });
  };

  const removeUserFromRole = (user: AdminUser) => {
    if (currentRoleSlug === "admin" && memberUsers.length <= 1) {
      Alert.alert(
        "Ação bloqueada",
        "Mantenha pelo menos um administrador ativo.",
      );
      return;
    }

    setRoleMutation.mutate({
      userId: user.id,
      nextRole: fallbackRole,
    });
  };

  const isLoading = isLoadingRoles || isLoadingPermissions || isLoadingUsers;
  const title = isCreatingRole ? "Nova função" : role?.name || "Função";

  return (
    <ScreenScroll contentClassName="gap-4 pb-28 pt-3">
      <View className="flex-row items-start gap-2">
        <Pressable
          className="w-9 items-center pt-1"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <AppIcon icon={ArrowLeft01Icon} size={24} />
        </Pressable>
        <HeaderBlock
          className="flex-1"
          title={title}
          subtitle="Edite detalhes, permissões e membros da função"
        />
      </View>

      {isLoading ? (
        <Surface className="flex-row items-center gap-3 p-4">
          <ActivityIndicator size="small" />
          <AppText tone="muted">Carregando função...</AppText>
        </Surface>
      ) : !isCreatingRole && !role ? (
        <Surface className="gap-2 p-4">
          <AppText className="font-bold">Função não encontrada</AppText>
          <AppText tone="muted">
            Volte para a lista e selecione outra função.
          </AppText>
        </Surface>
      ) : (
        <>
          <Surface className="gap-4 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <SectionHeader icon={ShieldBanIcon} label="Detalhes" />
              {role?.isSystem ? (
                <View className="rounded-md bg-app-accent-soft px-2 py-1 dark:bg-app-accent-soft-dark">
                  <AppText variant="smallBold">Sistema</AppText>
                </View>
              ) : null}
            </View>

            <TextField
              label="Nome"
              value={roleDraft.name}
              onChangeText={(value) =>
                setRoleDraft((current) => ({
                  ...current,
                  name: value,
                }))
              }
            />
            <TextField
              label="Descrição"
              value={roleDraft.description ?? ""}
              onChangeText={(value) =>
                setRoleDraft((current) => ({
                  ...current,
                  description: value,
                }))
              }
              multiline
            />
          </Surface>

          <Surface className="gap-4 p-4">
            <SectionHeader icon={CheckListIcon} label="Permissões" />
            {permissions.length === 0 ? (
              <AppText tone="muted">Nenhuma permissão disponível.</AppText>
            ) : (
              <View className="gap-4">
                {groupedPermissions.map((group) => (
                  <View key={group.category} className="gap-2">
                    <View className="flex-row items-center justify-between gap-3">
                      <AppText variant="label">{group.label}</AppText>
                      <View className="rounded-md bg-app-accent-soft px-2 py-0.5 dark:bg-app-accent-soft-dark">
                        <AppText variant="smallBold">
                          {group.permissions.length}
                        </AppText>
                      </View>
                    </View>
                    {group.permissions.map((permission) => (
                      <PermissionToggle
                        key={permission.id}
                        permission={permission}
                        enabled={roleDraft.permissionKeys.includes(
                          permission.key,
                        )}
                        onToggle={() => toggleDraftPermission(permission.key)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </Surface>

          {!isCreatingRole ? (
            <Surface className="gap-4 p-4">
              <SectionHeader icon={UserGroupIcon} label="Membros" />

              {availableUsers.length > 0 ? (
                <View className="gap-3">
                  <SelectField
                    label="Adicionar usuário"
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                    items={availableUsers.map((user) => ({
                      label: `${user.name || user.email} - ${user.email}`,
                      value: user.id,
                    }))}
                  />
                  <Pressable
                    className="min-h-11 flex-row items-center justify-center gap-2 rounded-lg bg-app-accent dark:bg-app-accent-dark"
                    onPress={addSelectedUser}
                    disabled={!selectedUserId || setRoleMutation.isPending}
                  >
                    <AppIcon icon={UserAdd01Icon} size={18} color="#17201A" />
                    <AppText className="font-bold text-app-text">
                      Adicionar membro
                    </AppText>
                  </Pressable>
                </View>
              ) : (
                <AppText tone="muted">
                  Todos os usuários já estão nesta função.
                </AppText>
              )}

              <View className="gap-2">
                {memberUsers.length === 0 ? (
                  <AppText tone="muted">Nenhum membro nesta função.</AppText>
                ) : (
                  memberUsers.map((user) => (
                    <View
                      key={user.id}
                      className="min-h-[58px] flex-row items-center gap-3 rounded-lg bg-app-background px-3 dark:bg-app-background-dark"
                    >
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-accent-soft dark:bg-app-accent-soft-dark">
                        <AppText className="font-extrabold text-app-accent dark:text-app-accent-dark">
                          {getInitials(user.name || user.email)}
                        </AppText>
                      </View>
                      <View className="min-w-0 flex-1">
                        <AppText className="font-bold" numberOfLines={1}>
                          {user.name || "Sem nome"}
                        </AppText>
                        <AppText variant="small" tone="muted" numberOfLines={1}>
                          {user.email}
                        </AppText>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remover ${user.name || user.email} desta função`}
                        onPress={() => removeUserFromRole(user)}
                        disabled={setRoleMutation.isPending}
                        className="h-10 w-10 items-center justify-center rounded-lg bg-app-surface dark:bg-app-surface-dark"
                      >
                        <AppIcon
                          icon={UserRemove01Icon}
                          size={18}
                          color="#E11D48"
                        />
                      </Pressable>
                    </View>
                  ))
                )}
              </View>
            </Surface>
          ) : null}

          <View className="gap-2">
            <PrimaryButton
              label={isCreatingRole ? "Criar função" : "Salvar função"}
              loading={saveRoleMutation.isPending}
              onPress={() => saveRoleMutation.mutate()}
            />
            {!isCreatingRole && role && !role.isSystem ? (
              <Pressable
                className="min-h-11 flex-row items-center justify-center gap-2 rounded-lg bg-app-background dark:bg-app-background-dark"
                onPress={confirmDeleteRole}
                disabled={deleteRoleMutation.isPending}
              >
                <AppIcon icon={Delete02Icon} size={18} color="#E11D48" />
                <AppText className="font-bold text-app-danger dark:text-app-danger-dark">
                  Remover função
                </AppText>
              </Pressable>
            ) : null}
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

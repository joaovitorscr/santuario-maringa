import { useQuery } from "@tanstack/react-query";

import { apiClient, unwrapApiResponse, type ApiCurrentPermissions } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export const appPermissions = {
  usersRead: "users.read",
  usersCreate: "users.create",
  usersUpdate: "users.update",
  usersDelete: "users.delete",
  rolesRead: "roles.read",
  rolesCreate: "roles.create",
  rolesUpdate: "roles.update",
  rolesDelete: "roles.delete",
  catsManage: "cats.manage",
  adoptionsManage: "adoptions.manage",
  adoptionCandidatesManage: "adoption_candidates.manage",
} as const;

export type AppPermission = (typeof appPermissions)[keyof typeof appPermissions];

export const currentPermissionsQueryKey = ["me", "permissions"] as const;

export async function fetchCurrentPermissions() {
  const response = await apiClient.me.permissions.$get();
  const payload = await unwrapApiResponse<ApiCurrentPermissions>("/me/permissions", response);

  return payload.data;
}

function hasAnyPermission(permissionSet: ReadonlySet<string>, permissions: AppPermission[]) {
  return permissions.some((permission) => permissionSet.has(permission));
}

export function useCurrentPermissions() {
  const { data: session } = authClient.useSession();
  const query = useQuery({
    queryKey: currentPermissionsQueryKey,
    queryFn: fetchCurrentPermissions,
    enabled: Boolean(session?.user),
    staleTime: 60_000,
  });
  const permissionSet = new Set(query.data?.permissions ?? []);
  const has = (permission: AppPermission) => permissionSet.has(permission);
  const hasAny = (permissions: AppPermission[]) => hasAnyPermission(permissionSet, permissions);

  return {
    ...query,
    permissions: query.data?.permissions ?? [],
    role: query.data?.role ?? null,
    has,
    hasAny,
    canManageCats: has(appPermissions.catsManage),
    canManageAdoptions: has(appPermissions.adoptionsManage),
    canManageAdoptionCandidates: has(appPermissions.adoptionCandidatesManage),
    canReadUsers: has(appPermissions.usersRead),
    canCreateUsers: has(appPermissions.usersCreate),
    canUpdateUsers: has(appPermissions.usersUpdate),
    canDeleteUsers: has(appPermissions.usersDelete),
    canReadRoles: has(appPermissions.rolesRead),
    canCreateRoles: has(appPermissions.rolesCreate),
    canUpdateRoles: has(appPermissions.rolesUpdate),
    canDeleteRoles: has(appPermissions.rolesDelete),
  };
}

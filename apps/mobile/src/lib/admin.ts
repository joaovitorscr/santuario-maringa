import {
  apiClient,
  unwrapApiResponse,
  type ApiAdminPermission,
  type ApiAdminRole,
  type ApiAdminUser,
} from "@/lib/api";

export const adminRolesQueryKey = ["admin", "roles"] as const;
export const adminPermissionsQueryKey = ["admin", "permissions"] as const;

export type AdminRolePayload = {
  name: string;
  description?: string | null;
  permissionKeys: string[];
};

export type AdminUserPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
};

export type AdminUserUpdatePayload = {
  name?: string;
  email?: string;
  role?: string;
};

export async function listAdminUsers() {
  const response = await apiClient.admin.users.$get();
  const payload = await unwrapApiResponse<ApiAdminUser[]>("/admin/users", response);

  return payload.data;
}

export async function createAdminUser(data: AdminUserPayload) {
  const response = await apiClient.admin.users.$post({
    json: {
      data,
    },
  });
  const payload = await unwrapApiResponse<ApiAdminUser>("/admin/users", response);

  return payload.data;
}

export async function updateAdminUser(id: string, data: AdminUserUpdatePayload) {
  const response = await apiClient.admin.users[":id"].$patch({
    param: { id },
    json: {
      data,
    },
  } as never);
  const payload = await unwrapApiResponse<ApiAdminUser>(`/admin/users/${id}`, response);

  return payload.data;
}

export async function listAdminRoles() {
  const response = await apiClient.admin.roles.$get();
  const payload = await unwrapApiResponse<ApiAdminRole[]>("/admin/roles", response);

  return payload.data;
}

export async function createAdminRole(data: AdminRolePayload) {
  const response = await apiClient.admin.roles.$post({
    json: {
      data,
    },
  });
  const payload = await unwrapApiResponse<ApiAdminRole>("/admin/roles", response);

  return payload.data;
}

export async function updateAdminRole(id: string, data: Partial<AdminRolePayload>) {
  const response = await apiClient.admin.roles[":id"].$patch({
    param: { id },
    json: {
      data,
    },
  } as never);
  const payload = await unwrapApiResponse<ApiAdminRole>(`/admin/roles/${id}`, response);

  return payload.data;
}

export async function deleteAdminRole(id: string) {
  const response = await apiClient.admin.roles[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    await unwrapApiResponse<null>(`/admin/roles/${id}`, response);
  }
}

export async function listAdminPermissions() {
  const response = await apiClient.admin.permissions.$get();
  const payload = await unwrapApiResponse<ApiAdminPermission[]>("/admin/permissions", response);

  return payload.data;
}

export async function deleteAdminUser(id: string) {
  const response = await apiClient.admin.users[":id"].$delete({
    param: { id },
  });

  if (!response.ok) {
    await unwrapApiResponse<null>(`/admin/users/${id}`, response);
  }
}

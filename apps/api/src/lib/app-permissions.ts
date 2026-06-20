import { db } from "@/db";
import { adminPermission, adminRole, adminRolePermission } from "@/db/schema/admin-role";
import { inArray } from "drizzle-orm";

export const defaultPermissions = [
  {
    key: "users.read",
    label: "Listar usuários",
    description: "Ver usuários e suas funções.",
  },
  {
    key: "users.create",
    label: "Criar usuários",
    description: "Cadastrar novas contas.",
  },
  {
    key: "users.update",
    label: "Editar usuários",
    description: "Alterar dados e funções.",
  },
  {
    key: "users.delete",
    label: "Remover usuários",
    description: "Excluir contas sem vínculos.",
  },
  {
    key: "roles.read",
    label: "Listar funções",
    description: "Ver funções e permissões.",
  },
  {
    key: "roles.create",
    label: "Criar funções",
    description: "Adicionar novas funções.",
  },
  {
    key: "roles.update",
    label: "Editar funções",
    description: "Alterar nomes e permissões.",
  },
  {
    key: "roles.delete",
    label: "Remover funções",
    description: "Excluir funções sem usuários.",
  },
  {
    key: "cats.manage",
    label: "Gerenciar gatos",
    description: "Criar e editar residentes.",
  },
  {
    key: "adoptions.manage",
    label: "Gerenciar adoções",
    description: "Criar e editar adoções.",
  },
  {
    key: "adoption_candidates.manage",
    label: "Gerenciar candidatos",
    description: "Criar e editar candidatos à adoção.",
  },
] as const;

const defaultRoles = [
  {
    slug: "admin",
    name: "Administrador",
    description: "Controle completo de usuários, funções, permissões e dados do app.",
    permissionKeys: defaultPermissions.map((permission) => permission.key),
  },
  {
    slug: "manager",
    name: "Gestor",
    description: "Pode gerenciar a operação e apoiar a administração de usuários.",
    permissionKeys: [
      "users.read",
      "users.create",
      "users.update",
      "roles.read",
      "cats.manage",
      "adoptions.manage",
      "adoption_candidates.manage",
    ],
  },
  {
    slug: "volunteer",
    name: "Voluntário",
    description: "Acesso operacional para o cuidado diário.",
    permissionKeys: ["cats.manage", "adoptions.manage", "adoption_candidates.manage"],
  },
  {
    slug: "user",
    name: "Usuário",
    description: "Acesso básico sem permissões administrativas.",
    permissionKeys: [],
  },
] as const;

function getPrimaryRoles(role?: string | null) {
  return (
    role
      ?.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

export async function ensureDefaultRolesAndPermissions() {
  const now = new Date();

  await db
    .insert(adminPermission)
    .values(
      defaultPermissions.map((permission) => ({
        id: crypto.randomUUID(),
        key: permission.key,
        label: permission.label,
        description: permission.description,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .onConflictDoNothing({ target: adminPermission.key });

  await db
    .insert(adminRole)
    .values(
      defaultRoles.map((role) => ({
        id: crypto.randomUUID(),
        slug: role.slug,
        name: role.name,
        description: role.description,
        isSystem: true,
        createdAt: now,
        updatedAt: now,
      })),
    )
    .onConflictDoNothing({ target: adminRole.slug });

  const roles = await db.query.adminRole.findMany();
  const permissions = await db.query.adminPermission.findMany();

  for (const defaultRole of defaultRoles) {
    const role = roles.find((item) => item.slug === defaultRole.slug);

    if (!role || defaultRole.permissionKeys.length === 0) {
      continue;
    }

    const rolePermissions = permissions
      .filter((permission) => defaultRole.permissionKeys.includes(permission.key as never))
      .map((permission) => ({
        roleId: role.id,
        permissionId: permission.id,
        createdAt: now,
      }));

    if (rolePermissions.length > 0) {
      await db.insert(adminRolePermission).values(rolePermissions).onConflictDoNothing();
    }
  }
}

export async function getRolePermissions(role?: string | null) {
  await ensureDefaultRolesAndPermissions();

  const roleSlugs = getPrimaryRoles(role);

  if (roleSlugs.includes("admin")) {
    return defaultPermissions.map((permission) => permission.key);
  }

  if (roleSlugs.length === 0) {
    return [];
  }

  const roles = await db.query.adminRole.findMany({
    where: inArray(adminRole.slug, roleSlugs),
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  const permissionKeys = Array.from(
    new Set(
      roles.flatMap((roleItem) =>
        roleItem.rolePermissions
          .map((rolePermission) => rolePermission.permission?.key)
          .filter((key): key is string => Boolean(key)),
      ),
    ),
  );

  // oxlint-disable-next-line unicorn/no-array-sort -- API TS target does not include Array#toSorted.
  return permissionKeys.sort();
}

export async function hasPermission(role: string | null | undefined, permission: string) {
  return (await getRolePermissions(role)).includes(permission);
}

export async function hasAnyPermission(role: string | null | undefined, permissions: string[]) {
  const userPermissions = await getRolePermissions(role);

  return permissions.some((permission) => userPermissions.includes(permission));
}

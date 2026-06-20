import { db } from "@/db";
import { account } from "@/db/schema/account";
import { adminPermission, adminRole, adminRolePermission } from "@/db/schema/admin-role";
import { session } from "@/db/schema/session";
import { user as userTable } from "@/db/schema/user";
import { buildApiErrorResponse, buildApiResponse } from "@/contracts/base";
import { and, count, eq, inArray } from "drizzle-orm";
import { type Context, Hono } from "hono";
import { z } from "zod";

type AdminEnv = {
  Variables: {
    user: { id: string; role?: string | null } | null;
  };
};

const app = new Hono<AdminEnv>();

const defaultPermissions = [
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

const RoleMutationSchema = z.object({
  data: z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().nullable().optional(),
    permissionKeys: z.array(z.string().trim().min(1)).default([]),
  }),
});

const RolePatchSchema = z.object({
  data: RoleMutationSchema.shape.data.partial().extend({
    slug: z.never().optional(),
  }),
});

function forbidden() {
  return buildApiErrorResponse({
    code: "FORBIDDEN",
    message: "Você não tem permissão para executar esta ação.",
  });
}

function invalidRequest(message: string) {
  return buildApiErrorResponse({
    code: "INVALID_ADMIN_REQUEST",
    message,
  });
}

function getPrimaryRoles(role?: string | null) {
  return (
    role
      ?.split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

async function getRolePermissions(role?: string | null) {
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

  return Array.from(
    new Set(
      roles.flatMap((roleItem) =>
        roleItem.rolePermissions
          .map((rolePermission) => rolePermission.permission?.key)
          .filter((key): key is string => Boolean(key)),
      ),
    ),
  ).toSorted();
}

async function hasPermission(role: string | null | undefined, permission: string) {
  return (await getRolePermissions(role)).includes(permission);
}

async function hasAnyPermission(role: string | null | undefined, permissions: string[]) {
  const userPermissions = await getRolePermissions(role);

  return permissions.some((permission) => userPermissions.includes(permission));
}

async function requirePermission(c: Context<AdminEnv>, permission: string) {
  const authUser = c.get("user");

  if (!(await hasPermission(authUser?.role, permission))) {
    return c.json(forbidden(), 403);
  }

  return null;
}

async function requireAnyPermission(c: Context<AdminEnv>, permissions: string[]) {
  const authUser = c.get("user");

  if (!(await hasAnyPermission(authUser?.role, permissions))) {
    return c.json(forbidden(), 403);
  }

  return null;
}

function slugifyRoleName(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  if (slug.length < 2 || !/^[a-z]/.test(slug)) {
    return "role";
  }

  return slug.slice(0, 40);
}

async function generateRoleSlug(name: string) {
  const baseSlug = slugifyRoleName(name);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const slug = `${baseSlug.slice(0, 40 - suffix.length)}${suffix}`;
    const existingRole = await db.query.adminRole.findFirst({
      where: eq(adminRole.slug, slug),
    });

    if (!existingRole) {
      return slug;
    }
  }

  return `${baseSlug.slice(0, 31)}-${crypto.randomUUID().slice(0, 8)}`;
}

async function ensureDefaultRolesAndPermissions() {
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

async function serializeRoles() {
  await ensureDefaultRolesAndPermissions();

  const roles = await db.query.adminRole.findMany({
    orderBy: (fields, { asc }) => [asc(fields.name)],
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
    },
  });

  const userCounts = await Promise.all(
    roles.map(async (role) => {
      const [result] = await db
        .select({ value: count() })
        .from(userTable)
        .where(eq(userTable.role, role.slug));

      return [role.slug, result?.value ?? 0] as const;
    }),
  );
  const countByRole = new Map(userCounts);

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    isSystem: role.isSystem,
    userCount: countByRole.get(role.slug) ?? 0,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    permissions: role.rolePermissions
      .map((rolePermission) => rolePermission.permission)
      .toSorted((left, right) => left.label.localeCompare(right.label))
      .map((permission) => ({
        id: permission.id,
        key: permission.key,
        label: permission.label,
        description: permission.description,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
      })),
  }));
}

async function setRolePermissions(roleId: string, permissionKeys: string[]) {
  await db.delete(adminRolePermission).where(eq(adminRolePermission.roleId, roleId));

  if (permissionKeys.length === 0) {
    return;
  }

  const uniquePermissionKeys = Array.from(new Set(permissionKeys));
  const permissions = await db.query.adminPermission.findMany({
    where: inArray(adminPermission.key, uniquePermissionKeys),
  });

  if (permissions.length !== uniquePermissionKeys.length) {
    throw new Error("Uma ou mais permissões não existem.");
  }

  await db
    .insert(adminRolePermission)
    .values(
      permissions.map((permission) => ({
        roleId,
        permissionId: permission.id,
        createdAt: new Date(),
      })),
    )
    .onConflictDoNothing();
}

app.get("/me/permissions", async (c) => {
  const authUser = c.get("user");

  return c.json(
    buildApiResponse({
      role: authUser?.role ?? null,
      permissions: await getRolePermissions(authUser?.role),
    }),
    200,
  );
});

app.get("/admin/roles", async (c) => {
  const permissionError = await requirePermission(c, "roles.read");
  if (permissionError) {
    return permissionError;
  }

  return c.json(buildApiResponse(await serializeRoles()), 200);
});

app.post("/admin/roles", async (c) => {
  const permissionError = await requirePermission(c, "roles.create");
  if (permissionError) {
    return permissionError;
  }

  const parsed = RoleMutationSchema.safeParse(await c.req.json().catch(() => null));

  if (!parsed.success) {
    return c.json(invalidRequest("Informe nome e permissões válidas."), 400);
  }

  const { name, description, permissionKeys } = parsed.data.data;
  const slug = await generateRoleSlug(name);
  const now = new Date();
  const [createdRole] = await db
    .insert(adminRole)
    .values({
      id: crypto.randomUUID(),
      name,
      slug,
      description: description ?? null,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: adminRole.id })
    .catch(() => []);

  if (!createdRole) {
    return c.json(invalidRequest("Já existe uma função com esse slug."), 400);
  }

  try {
    await setRolePermissions(createdRole.id, permissionKeys);
  } catch (error) {
    await db.delete(adminRole).where(eq(adminRole.id, createdRole.id));
    return c.json(
      invalidRequest(error instanceof Error ? error.message : "Permissões inválidas."),
      400,
    );
  }

  return c.json(
    buildApiResponse((await serializeRoles()).find((role) => role.id === createdRole.id)),
    201,
  );
});

app.patch("/admin/roles/:id", async (c) => {
  const permissionError = await requirePermission(c, "roles.update");
  if (permissionError) {
    return permissionError;
  }

  const parsed = RolePatchSchema.safeParse(await c.req.json().catch(() => null));

  if (!parsed.success) {
    return c.json(invalidRequest("Informe dados válidos para atualizar a função."), 400);
  }

  const id = c.req.param("id");
  const existingRole = await db.query.adminRole.findFirst({
    where: eq(adminRole.id, id),
  });

  if (!existingRole) {
    return c.json(
      buildApiErrorResponse({
        code: "ROLE_NOT_FOUND",
        message: "Função não encontrada.",
      }),
      404,
    );
  }

  const payload = parsed.data.data;

  try {
    await db.transaction(async (tx) => {
      if (payload.name || payload.description !== undefined) {
        await tx
          .update(adminRole)
          .set({
            name: payload.name,
            description: payload.description ?? undefined,
            updatedAt: new Date(),
          })
          .where(eq(adminRole.id, id));
      }

      if (payload.permissionKeys) {
        await tx.delete(adminRolePermission).where(eq(adminRolePermission.roleId, id));

        if (payload.permissionKeys.length > 0) {
          const uniquePermissionKeys = Array.from(new Set(payload.permissionKeys));
          const permissions = await tx.query.adminPermission.findMany({
            where: inArray(adminPermission.key, uniquePermissionKeys),
          });

          if (permissions.length !== uniquePermissionKeys.length) {
            throw new Error("Uma ou mais permissões não existem.");
          }

          await tx.insert(adminRolePermission).values(
            permissions.map((permission) => ({
              roleId: id,
              permissionId: permission.id,
              createdAt: new Date(),
            })),
          );
        }
      }
    });
  } catch (error) {
    return c.json(
      invalidRequest(error instanceof Error ? error.message : "Não foi possível salvar a função."),
      400,
    );
  }

  return c.json(buildApiResponse((await serializeRoles()).find((role) => role.id === id)), 200);
});

app.delete("/admin/roles/:id", async (c) => {
  const permissionError = await requirePermission(c, "roles.delete");
  if (permissionError) {
    return permissionError;
  }

  const id = c.req.param("id");
  const existingRole = await db.query.adminRole.findFirst({
    where: eq(adminRole.id, id),
  });

  if (!existingRole) {
    return c.json(
      buildApiErrorResponse({
        code: "ROLE_NOT_FOUND",
        message: "Função não encontrada.",
      }),
      404,
    );
  }

  if (existingRole.isSystem) {
    return c.json(invalidRequest("Funções do sistema não podem ser removidas."), 400);
  }

  const [usersInRole] = await db
    .select({ value: count() })
    .from(userTable)
    .where(eq(userTable.role, existingRole.slug));

  if ((usersInRole?.value ?? 0) > 0) {
    return c.json(invalidRequest("Remova essa função dos usuários antes de excluí-la."), 400);
  }

  await db.delete(adminRole).where(eq(adminRole.id, id));
  return c.body(null, 204);
});

app.get("/admin/permissions", async (c) => {
  const permissionError = await requireAnyPermission(c, [
    "roles.read",
    "roles.create",
    "roles.update",
  ]);
  if (permissionError) {
    return permissionError;
  }

  await ensureDefaultRolesAndPermissions();
  const permissions = await db.query.adminPermission.findMany({
    orderBy: (fields, { asc }) => [asc(fields.label)],
  });

  return c.json(
    buildApiResponse(
      permissions.map((permission) => ({
        id: permission.id,
        key: permission.key,
        label: permission.label,
        description: permission.description,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
      })),
    ),
    200,
  );
});

app.delete("/admin/users/:id", async (c) => {
  const permissionError = await requirePermission(c, "users.delete");
  if (permissionError) {
    return permissionError;
  }

  const currentUser = c.get("user");
  const userId = c.req.param("id");

  if (currentUser?.id === userId) {
    return c.json(invalidRequest("Você não pode remover sua própria conta."), 400);
  }

  const existingUser = await db.query.user.findFirst({
    where: eq(userTable.id, userId),
  });

  if (!existingUser) {
    return c.json(
      buildApiErrorResponse({
        code: "USER_NOT_FOUND",
        message: "Usuário não encontrado.",
      }),
      404,
    );
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(session).where(eq(session.userId, userId));
      await tx.delete(account).where(eq(account.userId, userId));
      await tx
        .delete(userTable)
        .where(and(eq(userTable.id, userId), eq(userTable.email, existingUser.email)));
    });
  } catch {
    return c.json(
      invalidRequest(
        "Não foi possível remover esse usuário porque existem registros vinculados a ele.",
      ),
      400,
    );
  }

  return c.body(null, 204);
});

export { app as adminRoutes };

import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

export const adminAccessControl = createAccessControl(defaultStatements);

export const managerRole = adminAccessControl.newRole({
  user: ["create", "list", "get", "update", "set-password"],
  session: ["list"],
});

export const volunteerRole = adminAccessControl.newRole({
  user: [],
  session: [],
});

export const adminRoles = {
  admin: adminAc,
  manager: managerRole,
  volunteer: volunteerRole,
  user: userAc,
};

export type AppAdminRole = keyof typeof adminRoles;

export const roleOptions: { label: string; value: AppAdminRole; description: string }[] = [
  {
    label: "Administrador",
    value: "admin",
    description: "Controle completo de usuários, permissões e sessões.",
  },
  {
    label: "Gestor",
    value: "manager",
    description: "Pode listar, criar e atualizar usuários operacionais.",
  },
  {
    label: "Voluntário",
    value: "volunteer",
    description: "Acesso ao uso operacional do app, sem ações administrativas.",
  },
  {
    label: "Usuário",
    value: "user",
    description: "Perfil padrão do Better Auth, sem permissões administrativas.",
  },
];

export const permissionGroups = [
  {
    resource: "user",
    label: "Usuários",
    permissions: [
      { action: "create", label: "Criar usuários" },
      { action: "list", label: "Listar usuários" },
      { action: "get", label: "Ver detalhes" },
      { action: "update", label: "Atualizar dados" },
      { action: "set-role", label: "Alterar função" },
      { action: "set-password", label: "Definir senha" },
      { action: "ban", label: "Bloquear usuários" },
      { action: "delete", label: "Remover usuários" },
      { action: "impersonate", label: "Impersonar usuários" },
      { action: "impersonate-admins", label: "Impersonar admins" },
    ],
  },
  {
    resource: "session",
    label: "Sessões",
    permissions: [
      { action: "list", label: "Listar sessões" },
      { action: "revoke", label: "Revogar sessões" },
      { action: "delete", label: "Excluir sessões" },
    ],
  },
] as const;

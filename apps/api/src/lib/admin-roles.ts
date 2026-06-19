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

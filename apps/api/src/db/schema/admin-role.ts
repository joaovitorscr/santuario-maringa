import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const adminRole = pgTable(
  "admin_role",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("admin_role_slug_idx").on(table.slug)],
);

export const adminPermission = pgTable(
  "admin_permission",
  {
    id: uuid("id").primaryKey(),
    key: text("key").notNull().unique(),
    label: text("label").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("admin_permission_key_idx").on(table.key)],
);

export const adminRolePermission = pgTable(
  "admin_role_permission",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => adminRole.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => adminPermission.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("admin_role_permission_role_id_idx").on(table.roleId),
    index("admin_role_permission_permission_id_idx").on(table.permissionId),
  ],
);

export const adminRoleRelations = relations(adminRole, ({ many }) => ({
  rolePermissions: many(adminRolePermission),
}));

export const adminPermissionRelations = relations(
  adminPermission,
  ({ many }) => ({
    rolePermissions: many(adminRolePermission),
  }),
);

export const adminRolePermissionRelations = relations(
  adminRolePermission,
  ({ one }) => ({
    role: one(adminRole, {
      fields: [adminRolePermission.roleId],
      references: [adminRole.id],
    }),
    permission: one(adminPermission, {
      fields: [adminRolePermission.permissionId],
      references: [adminPermission.id],
    }),
  }),
);

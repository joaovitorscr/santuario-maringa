import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cat } from "./cat";

export const furType = pgTable(
  "fur_type",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull().unique(),
    pictureBase64: text("picture"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("fur_type_name_idx").on(table.name)],
);

export const furTypeRelations = relations(furType, ({ many }) => ({
  cats: many(cat),
}));

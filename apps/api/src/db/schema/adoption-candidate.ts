import { relations } from "drizzle-orm";
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { adoption } from "./adoption";

export const adoptionCandidate = pgTable(
  "adoption_candidates",
  {
    id: uuid("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    cellphone: varchar("cellphone", { length: 15 }).notNull(),
    cpf: varchar("cpf", { length: 14 }),
    address: varchar("address", { length: 255 }),
    observation: varchar("observation", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("adoption_candidates_name_idx").on(table.name),
    index("adoption_candidates_cellphone_idx").on(table.cellphone),
  ],
);

export const adoptionCandidateRelations = relations(adoptionCandidate, ({ many }) => ({
  adoptions: many(adoption),
}));

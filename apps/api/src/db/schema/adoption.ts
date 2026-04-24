import { relations } from "drizzle-orm";
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { adoptionCandidate } from "./adoption-candidate";
import { cat } from "./cat";

export const adoption = pgTable(
  "adoptions",
  {
    id: uuid("id").primaryKey(),
    adoptionCandidateId: uuid("adoption_candidate_id")
      .notNull()
      .references(() => adoptionCandidate.id, { onDelete: "restrict" }),
    catId: uuid("cat_id")
      .notNull()
      .references(() => cat.id, { onDelete: "restrict" }),
    adoptionDate: timestamp("adoption_date").notNull(),
    observation: varchar("observation", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("adoptions_adoption_candidate_id_idx").on(table.adoptionCandidateId),
    index("adoptions_cat_id_idx").on(table.catId),
  ],
);

export const adoptionRelations = relations(adoption, ({ one }) => ({
  adoptionCandidate: one(adoptionCandidate, {
    fields: [adoption.adoptionCandidateId],
    references: [adoptionCandidate.id],
  }),
  cat: one(cat, {
    fields: [adoption.catId],
    references: [cat.id],
  }),
}));

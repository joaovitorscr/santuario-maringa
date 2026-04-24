import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { adoption } from "./adoption";
import { furType } from "./fur-type";
import { user } from "./user";

export const adoptionStatusEnum = pgEnum("adoption_status", [
  "Adopted",
  "Adoption Process",
  "Available",
  "Not Available",
]);

export const genderEnum = pgEnum("gender", ["Male", "Female"]);

export const cat = pgTable(
  "cat",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    pictureBase64: text("picture"),
    adoptionTermBase64: text("adoption_term_base64"),
    adoptionTermMimeType: text("adoption_term_mime_type"),
    medicalExamBase64: text("medical_exam_base64"),
    medicalExamMimeType: text("medical_exam_mime_type"),
    furTypeId: uuid("fur_type_id").references(() => furType.id, { onDelete: "set null" }),
    adoptionStatus: adoptionStatusEnum("adoption_status").notNull().default("Not Available"),
    entryDate: timestamp("entry_date").notNull(),
    adoptionDate: timestamp("adoption_date"),
    birthDate: timestamp("birth_date"),
    race: text("race").notNull(),
    gender: genderEnum("gender").notNull(),
    isCastrated: boolean("is_castrated").default(false).notNull(),
    isVaccinated: boolean("is_vaccinated").default(false).notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    isFiv: boolean("is_fiv").default(false),
    isFelv: boolean("is_felv").default(false),
    observation: varchar("observation", { length: 500 }),
    createdByUserName: text("user_name").notNull(),
    createdByUserId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "no action" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("cat_created_by_user_id_idx").on(table.createdByUserId),
    index("cat_fur_type_id_idx").on(table.furTypeId),
  ],
);

export const catRelations = relations(cat, ({ one, many }) => ({
  adoptions: many(adoption),
  furType: one(furType, {
    fields: [cat.furTypeId],
    references: [furType.id],
  }),
  createdByUser: one(user, {
    fields: [cat.createdByUserId],
    references: [user.id],
  }),
}));

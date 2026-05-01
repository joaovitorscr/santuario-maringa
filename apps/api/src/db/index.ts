import "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
  },
  schema,
  casing: "snake_case",
});

export { db };

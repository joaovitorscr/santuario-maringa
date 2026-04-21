import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  },
  schema,
  casing: "snake_case",
});

export { db };

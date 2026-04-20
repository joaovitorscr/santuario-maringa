import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schemas/auth-schema"

const schema = {...authSchema};

const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    ssl: true,
  },
  schema,
});

export { db };

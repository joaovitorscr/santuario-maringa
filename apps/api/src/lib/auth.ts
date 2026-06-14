import "@/env";
import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { db } from "@/db";
import { trustedAuthOrigins } from "@/lib/trusted-origins";

export const AUTH_BASE_PATH = "/auth";

export const auth = betterAuth({
  basePath: AUTH_BASE_PATH,
  plugins: [expo(), openAPI(), username()],
  trustedOrigins: trustedAuthOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: false,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: (password: string) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    },
  },
});

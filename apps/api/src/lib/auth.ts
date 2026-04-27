import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { db } from "@/db";

export const auth = betterAuth({
  basePath: "/auth",
  plugins: [openAPI(), username()],
  trustedOrigins: [
    "santuario-maringa://",
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:8000",
          "exp://", // Trust all Expo URLs (prefix matching)
          "exp://**", // Trust all Expo URLs (wildcard matching)
          "exp://192.168.*.*:*/**", // Trust 192.168.x.x IP range with any port and path
        ]
      : []),
  ],
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

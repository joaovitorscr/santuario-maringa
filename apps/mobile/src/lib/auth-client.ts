import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { usernameClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  basePath: "/auth",
  baseURL: "http://localhost:8000",
  plugins: [
    expoClient({
      scheme: "santuario-maringa",
      storagePrefix: "santuario-maringa",
      storage: SecureStore,
    }),
    usernameClient(),
  ],
});

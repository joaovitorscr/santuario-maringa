import { apiBaseUrl } from "@/lib/api-config";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { adminClient, usernameClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";

import { adminAccessControl, adminRoles } from "@/lib/admin-roles";

export const authClient = createAuthClient({
  basePath: "/auth",
  baseURL: apiBaseUrl,
  plugins: [
    expoClient({
      scheme: "santuario-maringa",
      storagePrefix: "santuario-maringa",
      storage: SecureStore,
    }),
    usernameClient(),
    adminClient({
      ac: adminAccessControl,
      roles: adminRoles,
    }),
  ],
});

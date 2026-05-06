function resolveApiBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is not set. Define it in apps/mobile/.env before starting Expo.",
    );
  }

  return configuredUrl.replace(/\/+$/, "");
}

export const apiBaseUrl = resolveApiBaseUrl();

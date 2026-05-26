import { authClient } from "@/lib/auth-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, Platform, useColorScheme } from "react-native";

import "../global.css";

export default function RootLayout() {
  const { data: session } = authClient.useSession();
  const colorScheme = useColorScheme();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
          },
        },
      }),
  );

  const isLoggedIn = !!session;

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const hideNavigationBar = () => {
      void NavigationBar.setVisibilityAsync("hidden");
    };

    hideNavigationBar();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        hideNavigationBar();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  console.log({
    isLoggedIn,
    session,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="private" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import { useState } from "react";
import { View } from "react-native";

import { PrimaryButton } from "@/components/ui/button";
import { TextField } from "@/components/ui/form-fields";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await authClient.signIn.username({
      username,
      password,
    });

    console.log("After Login Request:", {
      data,
      error,
    });
  };

  return (
    <ScreenScroll contentClassName="flex-1 justify-center gap-6">
      <View className="gap-2">
        <HeaderBlock title="Santuario Maringa" subtitle="Entre para continuar" />
      </View>

      <Surface className="gap-4 p-4">
        <TextField
          label="Usuário"
          placeholder="Seu usuário"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
        />
        <TextField
          label="Senha"
          placeholder="Sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          revealable
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="password"
        />
        <PrimaryButton label="Entrar" onPress={handleLogin} />
      </Surface>
    </ScreenScroll>
  );
}

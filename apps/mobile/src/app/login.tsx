import { zodResolver } from "@hookform/resolvers/zod";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";

import { AppText } from "@/components/ui/app-text";
import { PrimaryButton } from "@/components/ui/button";
import { Form, FormTextField } from "@/components/ui/form";
import { HeaderBlock } from "@/components/ui/layout";
import { ScreenScroll } from "@/components/ui/screen";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/lib/auth-client";
import { type LoginFormValues, loginFormSchema } from "@/lib/auth-validation";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  const handleLogin = async (values: LoginFormValues) => {
    const { data, error } = await authClient.signIn.username({
      username: values.username,
      password: values.password,
    });

    console.log("After Login Request:", {
      data,
      error,
    });
  };

  return (
    <ScreenScroll
      contentClassName="flex-1 justify-center gap-5"
      contentContainerStyle={{ paddingTop: insets.top + 24 }}
    >
      <HeaderBlock title="Santuario Maringa" subtitle="Entre para continuar" />

      <Form {...loginForm}>
        <Surface className="gap-4 p-4">
          <FormTextField<LoginFormValues, "username">
            name="username"
            label="Usuário"
            placeholder="Seu usuário"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
          />
          <FormTextField<LoginFormValues, "password">
            name="password"
            label="Senha"
            placeholder="Sua senha"
            secureTextEntry
            revealable
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
          />
          <AppText tone="muted" className="text-sm leading-5">
            Use seu usuário e senha cadastrados.
          </AppText>
          <PrimaryButton
            label="Entrar"
            onPress={loginForm.handleSubmit(handleLogin)}
            loading={loginForm.formState.isSubmitting}
          />
        </Surface>
      </Form>
    </ScreenScroll>
  );
}

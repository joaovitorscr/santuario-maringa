import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import { Pressable, Switch, TextInput, View, type TextInputProps } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useTheme } from "@/hooks/use-theme";

type FieldProps = {
  label: string;
  className?: string;
};

function FieldLabel({ label }: Pick<FieldProps, "label">) {
  return (
    <AppText variant="smallBold" tone="muted" className="min-h-5">
      {label}
    </AppText>
  );
}

export type TextFieldProps = FieldProps &
  Pick<
    TextInputProps,
    | "value"
    | "placeholder"
    | "onChangeText"
    | "multiline"
    | "keyboardType"
    | "secureTextEntry"
    | "autoCapitalize"
    | "autoCorrect"
    | "textContentType"
    | "onBlur"
    | "editable"
  > & {
    revealable?: boolean;
    error?: string;
  };

export function TextField({
  label,
  className,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  keyboardType = "default",
  secureTextEntry,
  autoCapitalize = "sentences",
  autoCorrect = true,
  textContentType,
  onBlur,
  editable = true,
  revealable = false,
  error,
}: TextFieldProps) {
  const theme = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const shouldShowToggle = revealable && secureTextEntry;
  const isSecure = shouldShowToggle ? !passwordVisible : secureTextEntry;

  return (
    <View className={cn("gap-2", className)}>
      <FieldLabel label={label} />
      <View className="relative justify-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          onBlur={onBlur}
          editable={editable}
          textAlignVertical={multiline ? "top" : "center"}
          className={cn(
            "rounded-lg border border-app-border bg-app-background px-3 py-3 text-base font-medium text-app-text dark:border-app-border-dark dark:bg-app-background-dark dark:text-app-text-dark",
            multiline ? "min-h-[122px]" : "min-h-12",
            shouldShowToggle && "pr-16",
            !editable &&
              "bg-app-surface text-app-muted dark:bg-app-surface-dark dark:text-app-muted-dark",
          )}
        />
        {shouldShowToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((current) => !current)}
            className="absolute right-3 min-h-12 items-center justify-center"
            hitSlop={8}
          >
            <AppText variant="smallBold" tone="accent">
              {passwordVisible ? "Ocultar" : "Mostrar"}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="small" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

type SelectFieldOption = {
  label: string;
  value: string;
};

export type SelectFieldProps = FieldProps & {
  value: string;
  onValueChange: (value: string) => void;
  items: SelectFieldOption[];
  error?: string;
};

export function SelectField({
  label,
  value,
  onValueChange,
  items,
  className,
  error,
}: SelectFieldProps) {
  const theme = useTheme();

  return (
    <View className={cn("gap-2", className)}>
      {label ? <FieldLabel label={label} /> : null}
      <Dropdown
        mode="modal"
        data={items}
        value={value}
        labelField="label"
        valueField="value"
        placeholder={label || "Selecione"}
        onChange={(item) => onValueChange(item.value)}
        style={{
          minHeight: 48,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.background,
          paddingHorizontal: 12,
        }}
        containerStyle={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.backgroundElement,
        }}
        placeholderStyle={{
          color: value.startsWith("Selecione") ? theme.textSecondary : theme.text,
          fontSize: 16,
          fontWeight: "500",
        }}
        selectedTextStyle={{
          color: value.startsWith("Selecione") ? theme.textSecondary : theme.text,
          fontSize: 16,
          fontWeight: "500",
        }}
        itemTextStyle={{
          color: theme.text,
          fontSize: 16,
          fontWeight: "500",
        }}
        activeColor={theme.accentSoft}
        iconColor={theme.textSecondary}
        renderRightIcon={() => (
          <AppIcon icon={ArrowDown01Icon} size={22} color={theme.textSecondary} />
        )}
      />
      {error ? (
        <AppText variant="small" tone="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export type ToggleFieldProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleField({ label, value, onValueChange }: ToggleFieldProps) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center justify-between">
      <AppText className="text-lg leading-[22px]">{label}</AppText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: theme.successSoft }}
        thumbColor={theme.background}
      />
    </View>
  );
}

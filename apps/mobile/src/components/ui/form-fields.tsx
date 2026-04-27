import React, { useState } from 'react';
import { Pressable, Switch, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { cn } from '@/lib/cn';
import { useTheme } from '@/hooks/use-theme';

type FieldProps = {
  label: string;
  className?: string;
};

function FieldLabel({ label }: Pick<FieldProps, 'label'>) {
  return (
    <AppText variant="smallBold" tone="muted" className="min-h-5">
      {label}
    </AppText>
  );
}

type TextFieldProps = FieldProps &
  Pick<
    TextInputProps,
    | 'value'
    | 'placeholder'
    | 'onChangeText'
    | 'multiline'
    | 'keyboardType'
    | 'secureTextEntry'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'textContentType'
  > & {
    revealable?: boolean;
  };

export function TextField({
  label,
  className,
  value,
  placeholder,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  secureTextEntry,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  textContentType,
  revealable = false,
}: TextFieldProps) {
  const theme = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const shouldShowToggle = revealable && secureTextEntry;
  const isSecure = shouldShowToggle ? !passwordVisible : secureTextEntry;

  return (
    <View className={cn('flex-1 gap-2', className)}>
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
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn(
            'rounded-xl border border-app-border bg-app-background px-3 py-3 text-base font-medium text-app-text dark:border-app-border-dark dark:bg-app-background-dark dark:text-app-text-dark',
            multiline ? 'min-h-[122px]' : 'min-h-12',
            shouldShowToggle && 'pr-16',
          )}
        />
        {shouldShowToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((current) => !current)}
            className="absolute right-3 min-h-12 items-center justify-center"
            hitSlop={8}>
            <AppText variant="smallBold" tone="accent">
              {passwordVisible ? 'Ocultar' : 'Mostrar'}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type SelectFieldProps = FieldProps & {
  value: string;
  onPress: () => void;
};

export function SelectField({ label, value, onPress, className }: SelectFieldProps) {
  return (
    <View className={cn('flex-1 gap-2', className)}>
      <FieldLabel label={label} />
      <Pressable
        onPress={onPress}
        className="min-h-12 flex-row items-center justify-between rounded-xl border border-app-border bg-app-background px-3 dark:border-app-border-dark dark:bg-app-background-dark">
        <AppText tone={value.startsWith('Selecione') ? 'muted' : 'default'}>{value}</AppText>
        <AppText tone="muted">⌄</AppText>
      </Pressable>
    </View>
  );
}

type ToggleFieldProps = {
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

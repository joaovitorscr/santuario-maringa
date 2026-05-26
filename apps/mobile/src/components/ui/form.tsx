import React from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type PathValue,
  type UseFormReturn,
} from "react-hook-form";

import {
  SelectField,
  TextField,
  ToggleField,
  type SelectFieldProps,
  type TextFieldProps,
  type ToggleFieldProps,
} from "@/components/ui/form-fields";

export function Form<TFieldValues extends FieldValues>({
  children,
  ...form
}: UseFormReturn<TFieldValues> & { children: React.ReactNode }) {
  return <FormProvider {...form}>{children}</FormProvider>;
}

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return <Controller {...props} />;
}

type FormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<TextFieldProps, "value" | "onChangeText" | "error"> & {
  name: TName;
  formatValue?: (value: string) => string;
};

export function FormTextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, formatValue, ...props }: FormTextFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          value={typeof field.value === "string" ? field.value : ""}
          onBlur={field.onBlur}
          onChangeText={(value) => {
            const nextValue = formatValue ? formatValue(value) : value;

            field.onChange(nextValue as PathValue<TFieldValues, TName>);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

type FormSelectFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<SelectFieldProps, "value" | "onValueChange"> & {
  name: TName;
};

export function FormSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...props }: FormSelectFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <SelectField
          {...props}
          value={typeof field.value === "string" ? field.value : ""}
          onValueChange={(value) => field.onChange(value as PathValue<TFieldValues, TName>)}
        />
      )}
    />
  );
}

type FormToggleFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<ToggleFieldProps, "value" | "onValueChange"> & {
  name: TName;
};

export function FormToggleField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ name, ...props }: FormToggleFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <ToggleField
          {...props}
          value={Boolean(field.value)}
          onValueChange={(value) => field.onChange(value as PathValue<TFieldValues, TName>)}
        />
      )}
    />
  );
}

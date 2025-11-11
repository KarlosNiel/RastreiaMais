// components/form/RHFSwitch.tsx
"use client";

import { Switch, type SwitchProps } from "@heroui/react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

type BaseProps<T extends FieldValues> = {
  /** opcional: usa o control do FormProvider se não for passado */
  control?: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T>;
  /** rótulo exibido dentro do Switch (ou use children) */
  label?: React.ReactNode;
  /** callback com o valor booleano */
  onValueChange?: (value: boolean) => void;
} & Omit<
  SwitchProps,
  "isSelected" | "defaultSelected" | "onValueChange" | "children"
> & {
    children?: React.ReactNode;
  };

export function RHFSwitch<T extends FieldValues>({
  control: controlProp,
  name,
  rules,
  label,
  onValueChange,
  children,
  ...rest
}: BaseProps<T>) {
  const ctx = useFormContext<T>();
  const control = (controlProp ?? ctx?.control)!;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <div>
          <Switch
            {...rest}
            classNames={
              {
                wrapper: "dark:bg-gray-800"
              }
            }
            isSelected={!!field.value}
            onValueChange={(v) => {
              field.onChange(v);
              onValueChange?.(v);
            }}
          >
            {children ?? label}
          </Switch>

          {fieldState.error && (
            <p className="mt-1 text-sm text-danger">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

export default RHFSwitch;

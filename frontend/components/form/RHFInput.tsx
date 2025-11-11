// frontend/components/form/RHFInput.tsx
"use client";

import { Input, type InputProps } from "@heroui/react";
import { useCallback } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

type BaseProps<T extends FieldValues> = {
  /** opcional: se não vier, usa o FormProvider */
  control?: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T>;
  label?: string;
  placeholder?: string;
  type?: string;
  /** callback ao mudar (valor já parseado) */
  onValueChange?: (value: any, raw: string) => void;
  /** Parser: string -> qualquer (remove máscara, coerce number/date etc.) */
  valueParser?: (raw: string) => any;
  /** Formatter: qualquer -> string (recoloca máscara p/ exibição) */
  valueFormatter?: (value: any) => string;
  /** Remove não-dígitos antes do parser (CPF/CEP/telefone) */
  numericOnly?: boolean;
  /** Valor vazio padrão (default: "") caso o form não tenha default */
  emptyDefaultValue?: string;
} & Omit<
  InputProps,
  "name" | "value" | "onChange" | "label" | "placeholder" | "type"
>;

export function RHFInput<T extends FieldValues>({
  control: controlProp,
  name,
  rules,
  label,
  placeholder,
  type,
  onValueChange,
  valueParser,
  valueFormatter,
  numericOnly,
  emptyDefaultValue = "",
  ...rest
}: BaseProps<T>) {
  const ctx = useFormContext<T>();
  const control = (controlProp ?? ctx?.control)!;

  const handleParse = useCallback(
    (raw: string) => {
      const cleaned = numericOnly ? raw.replace(/\D+/g, "") : raw;
      return valueParser ? valueParser(cleaned) : cleaned;
    },
    [numericOnly, valueParser]
  );

  const handleFormat = useCallback(
    (val: any) => {
      if (valueFormatter) return valueFormatter(val);
      if (val === null || typeof val === "undefined") return "";
      return String(val);
    },
    [valueFormatter]
  );

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={emptyDefaultValue as any} // <- garante string (evita undefined)
      rules={rules}
      render={({ field, fieldState }) => {
        const displayed = handleFormat(field.value);

        return (
          <Input
            classNames={
              {
                inputWrapper: "dark:bg-gray-800"
              }
            }
            // RHF injeta { name, onBlur, ref } — mantemos.
            name={field.name}
            onBlur={field.onBlur}
            // usamos onValueChange do HeroUI (não o onChange nativo)
            value={displayed}
            onValueChange={(raw) => {
              const parsed = handleParse(raw);
              field.onChange(parsed);
              onValueChange?.(parsed, raw);
            }}
            ref={field.ref}
            type={type}
            label={label}
            labelPlacement={rest.labelPlacement ?? "outside"}
            placeholder={placeholder}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            {...rest}
          />
        );
      }}
    />
  );
}

export default RHFInput;

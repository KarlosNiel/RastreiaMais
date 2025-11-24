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
    [numericOnly, valueParser],
  );

  const handleFormat = useCallback(
    (val: any) => {
      if (valueFormatter) return valueFormatter(val);
      if (val === null || typeof val === "undefined") return "";

      return String(val);
    },
    [valueFormatter],
  );

  return (
    <Controller
      control={control}
      defaultValue={emptyDefaultValue as any} // <- garante string (evita undefined)
      name={name}
      render={({ field, fieldState }) => {
        const displayed = handleFormat(field.value);

        return (
          <Input
            // RHF injeta { name, onBlur, ref } — mantemos ref aqui
            ref={field.ref}
            classNames={{
              inputWrapper: "dark:bg-gray-800",
            }}
            errorMessage={fieldState.error?.message}
            isInvalid={!!fieldState.error}
            label={label}
            labelPlacement={rest.labelPlacement ?? "outside"}
            name={field.name}
            placeholder={placeholder}
            type={type}
            value={displayed}
            {...rest}
            // callbacks no final (regra react/jsx-sort-props)
            onBlur={field.onBlur}
            onValueChange={(raw) => {
              const parsed = handleParse(raw);

              field.onChange(parsed);
              onValueChange?.(parsed, raw);
            }}
          />
        );
      }}
      rules={rules}
    />
  );
}

export default RHFInput;

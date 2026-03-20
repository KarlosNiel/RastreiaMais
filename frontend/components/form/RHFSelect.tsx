"use client";

import type { Key } from "@react-types/shared";

import { Select, SelectItem, type SelectProps } from "@heroui/react";
// ❌ removido: import { useMemo } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

export type SelectOption = {
  key: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

type BaseProps<T extends FieldValues> = {
  /** opcional: usa o control do FormProvider se não for passado */
  control?: Control<T>;
  name: Path<T>;
  rules?: RegisterOptions<T>;
  /** use isto para montar as opções (em vez de children) */
  options?: SelectOption[];
  /** callback com o valor já normalizado para RHF */
  onValueChange?: (value: string | string[] | undefined) => void;
} & Omit<
  SelectProps,
  // conflitam com RHF/HeroUI internamente
  "selectedKeys" | "onSelectionChange" | "children"
>;

export function RHFSelect<T extends FieldValues>({
  control: controlProp,
  name,
  rules,
  options,
  onValueChange,
  selectionMode = "single",
  labelPlacement = "outside",
  ...rest
}: BaseProps<T>) {
  const ctx = useFormContext<T>();
  const control = (controlProp ?? ctx?.control)!;

  const isMultiple = selectionMode === "multiple";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // ---- value -> selectedKeys (sempre Set<Key> com strings)
        const selectedKeys: Set<Key> = (() => {
          if (isMultiple) {
            const arr = Array.isArray(field.value) ? field.value : [];

            return new Set<Key>(arr.map((v) => String(v) as Key));
          }

          if (
            field.value === undefined ||
            field.value === null ||
            field.value === ""
          ) {
            return new Set<Key>();
          }

          return new Set<Key>([String(field.value) as Key]);
        })();

        // ---- onSelectionChange (HeroUI -> RHF)
        const handleSelection = (keys: "all" | Set<Key>) => {
          if (keys === "all") return; // não usamos 'all'

          // Set<Key> -> string[]
          const arr = Array.from(keys).map((k) => String(k));
          const next = isMultiple ? arr : arr[0];

          field.onChange(next);
          onValueChange?.(next);
        };

        const items = options ?? []; // nunca undefined

        return (
          <Select
            {...rest}
            classNames={{
              trigger: "dark:bg-gray-800",
            }}
            errorMessage={fieldState.error?.message}
            isInvalid={!!fieldState.error}
            labelPlacement={labelPlacement}
            selectedKeys={selectedKeys as Iterable<Key>}
            selectionMode={selectionMode}
            onSelectionChange={handleSelection}
          >
            {items.map((opt) => (
              <SelectItem
                key={opt.key}
                description={opt.description}
                isDisabled={opt.disabled}
                textValue={opt.label}
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      }}
      rules={rules}
    />
  );
}

export default RHFSelect;

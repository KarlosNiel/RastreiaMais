// components/form/RHFSelect.tsx
"use client";

import { Select, SelectItem, type SelectProps } from "@heroui/react";
import type { Key } from "@react-types/shared";
import { useMemo } from "react";
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
      rules={rules}
      render={({ field, fieldState }) => {
        // ---- value -> selectedKeys (sempre Set<Key> com strings)
        const selectedKeys = useMemo<Set<Key>>(() => {
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
        }, [field.value, isMultiple]);

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
            classNames={
              {
                trigger: "dark:bg-gray-800"
              }
            }
            selectionMode={selectionMode}
            selectedKeys={selectedKeys as Iterable<Key>}
            onSelectionChange={handleSelection}
            labelPlacement={labelPlacement}
            isInvalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          >
            {items.map((opt) => (
              <SelectItem
                key={opt.key}
                textValue={opt.label}
                isDisabled={opt.disabled}
                description={opt.description}
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        );
      }}
    />
  );
}

export default RHFSelect;

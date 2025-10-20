// components/form/RHFChipGroup.tsx
"use client";

import { Chip } from "@heroui/react";
import clsx from "clsx";
import { useCallback, useMemo, useRef } from "react";
import {
  Controller,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

export type ChipOption = { label: string; value: string; disabled?: boolean };

type BaseProps<T extends FieldValues> = {
  control?: Control<T>;
  name: Path<T>;
  label?: string;
  options: ChipOption[];
  rules?: RegisterOptions<T>;
  className?: string;
  onValueChange?: (value: any) => void;
  chipsClassName?: string;
};

type SingleProps<T extends FieldValues> = BaseProps<T> & {
  single: true;
  multiple?: never;
  allowDeselect?: boolean;
};

type MultipleProps<T extends FieldValues> = BaseProps<T> & {
  multiple: true;
  single?: never;
  allowDeselect?: never;
};

type Props<T extends FieldValues> = SingleProps<T> | MultipleProps<T>;

export function RHFChipGroup<T extends FieldValues>(props: Props<T>) {
  const {
    control: controlProp,
    name,
    label,
    options,
    rules,
    className,
    onValueChange,
    chipsClassName,
  } = props;

  const ctx = useFormContext<T>();
  const control = (controlProp ?? ctx?.control)!;

  // Refs dos itens (div do Chip)
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);

  const isSingle = "single" in props && props.single === true;
  const isMultiple = "multiple" in props && props.multiple === true;
  if (!isSingle && !isMultiple) {
    throw new Error("RHFChipGroup: defina 'single' OU 'multiple'.");
  }

  const role = isSingle ? "radiogroup" : "group";
  const itemRole = isSingle ? "radio" : "checkbox";

  const moveFocus = useCallback(
    (currentIdx: number, dir: "prev" | "next" | "home" | "end") => {
      let idx = currentIdx;
      if (dir === "prev")
        idx = (currentIdx - 1 + options.length) % options.length;
      if (dir === "next") idx = (currentIdx + 1) % options.length;
      if (dir === "home") idx = 0;
      if (dir === "end") idx = options.length - 1;
      chipRefs.current[idx]?.focus?.();
    },
    [options.length]
  );

  const isSelected = useCallback(
    (currentValue: any, optValue: string) => {
      if (isSingle) return currentValue === optValue;
      if (Array.isArray(currentValue)) return currentValue.includes(optValue);
      return false;
    },
    [isSingle]
  );

  const toggleValue = useCallback(
    (currentValue: any, optValue: string) => {
      let next: any;
      if (isSingle) {
        const allowDeselect = (props as SingleProps<T>).allowDeselect ?? false;
        next =
          currentValue === optValue && allowDeselect ? undefined : optValue;
      } else {
        const arr = Array.isArray(currentValue) ? [...currentValue] : [];
        const idx = arr.indexOf(optValue);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(optValue);
        next = arr;
      }
      return next;
    },
    [isSingle, props]
  );

  const ariaLabel = useMemo(() => label || name.toString(), [label, name]);

  return (
    <div className={className}>
      {label && (
        <div className="mb-1 text-sm font-medium text-foreground">{label}</div>
      )}

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field, fieldState }) => {
          const value = field.value;

          return (
            <>
              <div
                role={role}
                aria-label={ariaLabel}
                className={clsx("flex flex-wrap gap-2.5", chipsClassName)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (
                    e.key === "ArrowRight" ||
                    e.key === "ArrowDown" ||
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    chipRefs.current[0]?.focus?.();
                  }
                }}
              >
                {options.map((opt, i) => {
                  const selected = isSelected(value, opt.value);
                  const variant = selected ? "solid" : "flat";
                  const color = selected ? "primary" : "default";

                  return (
                    <Chip
                      key={opt.value}
                      ref={(el) => {
                        // importante: não retornar nada aqui (void)
                        chipRefs.current[i] = el;
                      }}
                      as="button"
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => {
                        const next = toggleValue(value, opt.value);
                        field.onChange(next);
                        onValueChange?.(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const next = toggleValue(value, opt.value);
                          field.onChange(next);
                          onValueChange?.(next);
                        }
                        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                          e.preventDefault();
                          moveFocus(i, "prev");
                        }
                        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                          e.preventDefault();
                          moveFocus(i, "next");
                        }
                        if (e.key === "Home") {
                          e.preventDefault();
                          moveFocus(i, "home");
                        }
                        if (e.key === "End") {
                          e.preventDefault();
                          moveFocus(i, "end");
                        }
                      }}
                      aria-checked={selected}
                      role={itemRole}
                      variant={variant as any}
                      color={color as any}
                      size="md"
                      radius="full"
                      className={clsx(
                        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-focus/50 data-[hover=true]:opacity-90",
                        opt.disabled && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      {opt.label}
                    </Chip>
                  );
                })}
              </div>

              {fieldState.error && (
                <p className="mt-1 text-sm text-danger">
                  {fieldState.error.message}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}

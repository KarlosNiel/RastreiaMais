// frontend/components/form/RHFDate.tsx
"use client";

import { DatePicker, type DatePickerProps } from "@heroui/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";

/**
 * Converte valor do form (Date | string | undefined) para CalendarDate (DateValue)
 * sem armadilha de fuso (usa apenas ano/mês/dia).
 */
function toCalendarDate(v: unknown): CalendarDate | null {
  if (!v) return null;

  // String no formato YYYY-MM-DD → parseDate
  if (typeof v === "string") {
    // Tentamos parse "YYYY-MM-DD"; se vier outro formato, tentamos Date
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);

    if (m) return parseDate(v);

    const d = new Date(v);

    if (!Number.isNaN(d.getTime())) {
      return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
    }

    return null;
  }

  // Date
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return new CalendarDate(v.getFullYear(), v.getMonth() + 1, v.getDate());
  }

  return null;
}

/**
 * Converte CalendarDate (DateValue) para Date local sem usar timezone UTC.
 * Mantemos apenas Y/M/D (00:00 local).
 */
function calendarDateToDate(cd: CalendarDate | null): Date | undefined {
  if (!cd) return undefined;

  return new Date(cd.year, cd.month - 1, cd.day);
}

export type RHFDateProps = Omit<
  DatePickerProps,
  "value" | "defaultValue" | "onChange" | "errorMessage"
> & {
  /** nome do campo no RHF (ex.: "socio.nascimento") */
  name: string;
  /** descrição opcional (sub-label) */
  description?: React.ReactNode;
  /** força estado de requerido apenas visual (regra real fica no Zod) */
  isRequired?: boolean;
};

/**
 * RHFDate — wrapper do HeroUI DatePicker integrado ao react-hook-form
 * - Valor no form armazena um Date (sem fuso).
 * - Aceita valores existentes como Date ou "YYYY-MM-DD".
 */
export function RHFDate({
  name,
  label,
  description,
  isRequired,
  className,
  labelPlacement,
  ...pickerProps
}: RHFDateProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name as any}
      render={({ field, fieldState }) => {
        const { onChange, value, ref, ...restField } = field;
        const dateValue = toCalendarDate(value);

        return (
          <DatePicker
            {...pickerProps}
            {...restField}
            ref={ref}
            className={className}
            classNames={{ inputWrapper: "dark:bg-gray-800" }}
            description={fieldState.error ? undefined : description}
            errorMessage={fieldState.error?.message}
            granularity={pickerProps.granularity ?? "day"}
            isInvalid={!!fieldState.error}
            isRequired={isRequired}
            label={label}
            labelPlacement={labelPlacement ?? "outside"}
            value={dateValue as any}
            onChange={(dv) => {
              const jsDate = calendarDateToDate(dv as CalendarDate | null);

              onChange(jsDate);
            }}
          />
        );
      }}
    />
  );
}

export default RHFDate;

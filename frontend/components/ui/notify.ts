// components/ui/notify.ts
import { addToast, type ButtonProps } from "@heroui/react";

type ToastVariant = Extract<
  ButtonProps["variant"],
  "solid" | "bordered" | "flat"
>;
type ToastColor = NonNullable<ButtonProps["color"]>;

export function notify(
  title: string,
  description?: string,
  opts?: { variant?: ToastVariant; color?: ToastColor }
) {
  addToast({
    title,
    description,
    variant: opts?.variant ?? "solid",
    color: opts?.color ?? "success",
  });
}

export const notifySuccess = (msg: string, desc?: string) =>
  notify(msg, desc, { color: "success", variant: "solid" });

export const notifyError = (msg: string, desc?: string) =>
  notify(msg, desc, { color: "danger", variant: "solid" });

export const notifyWarn = (msg: string, desc?: string) =>
  notify(msg, desc, { color: "warning", variant: "flat" }); // <- trocado de "faded" para "flat"

export const notifyInfo = (msg: string, desc?: string) =>
  notify(msg, desc, { color: "primary", variant: "bordered" });

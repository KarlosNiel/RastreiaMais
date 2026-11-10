// frontend/app/layout.tsx
import type { Metadata, Viewport } from "next";

import Providers from "./providers";

import { AppShell } from "@/components/layout/AppShell";
import { fontDisplay, fontHeading, fontMono, fontSans } from "@/config/fonts";
import { app as cfg } from "@/config/rastreiamais";
import { cn } from "@/lib/utils";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: cfg.name,
    template: `%s | ${cfg.name}`,
  },
  description: cfg.description,
  applicationName: cfg.name,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={cn(
        fontSans.variable,
        fontHeading.variable,
        fontMono.variable,
        fontDisplay.variable,
      )}
      lang="pt-BR"
    >
      <body
        suppressHydrationWarning
        className="min-h-svh md:min-h-dvh font-sans antialiased bg-slate-50/70 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors overscroll-none"
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

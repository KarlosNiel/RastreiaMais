// frontend/app/layout.tsx
import type { Metadata, Viewport } from "next";

import Providers from "./providers";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { fontHeading, fontMono, fontSans } from "@/config/fonts";
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
      className={cn(fontSans.variable, fontHeading.variable, fontMono.variable)}
      lang="pt-BR"
    >
      <body
        suppressHydrationWarning
        className="min-h-svh md:min-h-dvh font-sans antialiased overflow-y-scroll scrollbar-none dark:bg-slate-950"
      >
        <Providers>
          <div className="relative z-50">
            <Header />
          </div>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

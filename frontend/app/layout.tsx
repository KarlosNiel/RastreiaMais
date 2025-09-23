// frontend/app/layout.tsx
import { fontHeading, fontMono, fontSans } from "@/config/fonts";
import { app as cfg } from "@/config/rastreiamais";
import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import Providers from "./providers";

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
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontHeading.variable, fontMono.variable)}
    >
      <body
        suppressHydrationWarning
        className="min-h-svh md:min-h-dvh font-sans antialiased"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

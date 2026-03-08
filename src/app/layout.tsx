import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SANDECH CRM",
  description: "CRM técnico-comercial para engenharia consultiva",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

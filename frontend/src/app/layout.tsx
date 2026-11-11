import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter, SiteHeader, SiteHeaderFallback } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa Clara | Encontre seu próximo endereço",
  description:
    "Explore imóveis e encontre um endereço que combine com a vida que você quer viver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {/* O cabeçalho lê a rota atual e a sessão; o fallback aparece enquanto isso */}
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

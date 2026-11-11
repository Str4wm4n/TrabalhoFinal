import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter, SiteHeader, SiteHeaderFallback } from "@/components/SiteHeader";
import "./globals.css";

// Inter servida pelo próprio Next (sem requisição ao Google no navegador).
// A variável --font-inter é usada pelo token --font-sans no globals.css.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Teto & Tretas | Imóveis para alugar e comprar",
  description:
    "Teto & Tretas: encontre imóveis para alugar e comprar com informação clara, do primeiro clique ao contrato.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
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

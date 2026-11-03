import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Carregando } from "@/components/Feedback";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Entrar | Teto & Tretas",
};

export default function LoginPage() {
  return (
    <main className="page page-narrow">
      {/* O formulário lê ?voltar= e ?motivo= da URL, por isso fica em Suspense */}
      <Suspense fallback={<Carregando />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

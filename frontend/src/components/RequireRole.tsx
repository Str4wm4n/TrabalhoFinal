"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AREA_INICIAL, motivoUltimaSaida, useSessao, type Perfil } from "@/lib/auth";
import { Carregando } from "./Feedback";

/**
 * Rota protegida por perfil.
 * - sem sessão (nunca logou, saiu ou token expirou) -> vai para o login
 * - logado com outro perfil -> mostra "acesso negado" (a tela não aparece)
 * - perfil certo -> mostra a tela
 */
export function RequireRole({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  const sessao = useSessao();
  const router = useRouter();
  const caminho = usePathname();

  useEffect(() => {
    if (sessao !== null) return;

    const motivo = motivoUltimaSaida();
    const parametros = new URLSearchParams();
    if (motivo) parametros.set("motivo", motivo);
    // Depois do login, volta para a tela que a pessoa tentou abrir.
    if (motivo !== "logout") parametros.set("voltar", caminho);
    router.replace(`/login?${parametros}`);
  }, [sessao, caminho, router]);

  if (sessao === undefined) {
    return <Carregando texto="Verificando sua sessão..." />;
  }

  if (sessao === null) {
    return <Carregando texto="Redirecionando para o login..." />;
  }

  if (sessao.tipo !== perfil) {
    return (
      <div className="api-message api-error" role="alert">
        <strong>Acesso negado.</strong>
        <p>Esta área é exclusiva para {perfil === "ADMIN" ? "administradores" : "clientes"}.</p>
        <Link className="text-button" href={AREA_INICIAL[sessao.tipo]}>
          Ir para a minha área
        </Link>
      </div>
    );
  }

  return children;
}

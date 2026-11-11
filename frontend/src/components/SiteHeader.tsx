"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AREA_INICIAL, encerrarSessao, useSessao } from "@/lib/auth";
import { IconLogin, IconLogout, LogoMark } from "./Icons";

function Marca({ className = "brand" }: { className?: string }) {
  return (
    <Link className={className} href="/" aria-label="Teto & Tretas, página inicial">
      <LogoMark />
      <span>
        Teto <span className="brand-amp">&amp;</span> Tretas
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const sessao = useSessao();
  const router = useRouter();
  const caminho = usePathname();

  function sair() {
    encerrarSessao("logout");
    router.push("/login?motivo=logout");
  }

  const ativo = (href: string) =>
    (href === "/" ? caminho === "/" : caminho.startsWith(href)) ? "page" : undefined;

  return (
    <header className="site-header">
      <Marca />

      <nav className="main-nav" aria-label="Navegação principal">
        <Link href="/" aria-current={ativo("/")}>
          Imóveis
        </Link>
        {/* O menu só mostra as opções do perfil logado */}
        {sessao?.tipo === "USER" && (
          <Link href={AREA_INICIAL.USER} aria-current={ativo(AREA_INICIAL.USER)}>
            Minha área
          </Link>
        )}
        {sessao?.tipo === "ADMIN" && (
          <Link href={AREA_INICIAL.ADMIN} aria-current={ativo(AREA_INICIAL.ADMIN)}>
            Painel
          </Link>
        )}
      </nav>

      <div className="header-actions">
        {sessao === undefined ? (
          // Primeira renderização: ainda não lemos o localStorage
          <span className="header-placeholder" aria-hidden="true" />
        ) : sessao ? (
          <>
            <span className="header-user" title={sessao.email}>
              <span className="role-badge">{sessao.tipo === "ADMIN" ? "Admin" : "Cliente"}</span>
              <span className="header-email">{sessao.email}</span>
            </span>
            <button type="button" className="header-link header-button" onClick={sair}>
              <IconLogout /> Sair
            </button>
          </>
        ) : (
          <Link className="header-link" href="/login">
            <IconLogin /> Entrar
          </Link>
        )}
      </div>
    </header>
  );
}

/** Versão estática do cabeçalho, mostrada enquanto a rota atual é resolvida. */
export function SiteHeaderFallback() {
  return (
    <header className="site-header">
      <Marca />
      <nav className="main-nav" aria-label="Navegação principal">
        <Link href="/">Imóveis</Link>
      </nav>
      <div className="header-actions">
        <span className="header-placeholder" aria-hidden="true" />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contato">
      <Marca className="brand footer-brand" />
      <p>Teto bom, sem treta.</p>
      <span className="footer-note">Projeto demonstrativo · 2026</span>
    </footer>
  );
}

"use client";

import { useSyncExternalStore } from "react";

export type Perfil = "ADMIN" | "USER";

export interface Sessao {
  token: string;
  tipo: Perfil;
  email: string;
  /** Momento (ms) em que o token expira, lido do campo "exp" do JWT. */
  expiraEm: number;
}

/** Por que a sessão terminou: usado pela tela de login para avisar o usuário. */
export type MotivoSaida = "logout" | "expirada";

const CHAVE_TOKEN = "imobiliaria.token";
const CHAVE_TIPO = "imobiliaria.tipo";

/** Área inicial de cada perfil depois do login. */
export const AREA_INICIAL: Record<Perfil, string> = {
  USER: "/cliente",
  ADMIN: "/admin",
};

// ---------------------------------------------------------------------------
// Leitura do token
// ---------------------------------------------------------------------------

/**
 * O JWT tem 3 partes separadas por ponto: cabeçalho.payload.assinatura.
 * O payload é só Base64URL (por isso o jwt.io consegue mostrá-lo).
 * Aqui só LEMOS o payload; quem garante que ele não foi alterado é o
 * backend, que confere a assinatura em toda requisição.
 */
function lerPayload(token: string): Record<string, unknown> | null {
  const partes = token.split(".");
  if (partes.length !== 3) return null;

  try {
    const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      Array.from(atob(base64), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );
    const payload: unknown = JSON.parse(json);
    return typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function montarSessao(token: string | null, tipo: string | null): Sessao | null {
  if (!token || (tipo !== "ADMIN" && tipo !== "USER")) return null;

  const payload = lerPayload(token);
  if (!payload || typeof payload.exp !== "number" || typeof payload.sub !== "string") {
    return null;
  }

  const expiraEm = payload.exp * 1000;
  if (expiraEm <= Date.now()) return null;

  return { token, tipo, email: payload.sub, expiraEm };
}

// ---------------------------------------------------------------------------
// "Store" da sessão: localStorage + aviso para os componentes React
// ---------------------------------------------------------------------------

let sessaoAtual: Sessao | null = null;
let carregada = false;
let ultimoMotivo: MotivoSaida | null = null;
let timerExpiracao: ReturnType<typeof setTimeout> | undefined;
const ouvintes = new Set<() => void>();

function lerStorage(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

/** Agenda o encerramento automático da sessão no instante em que o token vence. */
function agendarExpiracao(sessao: Sessao | null) {
  clearTimeout(timerExpiracao);
  if (!sessao) return;
  // setTimeout aceita no máximo ~24,8 dias; tokens deste projeto duram 1 hora.
  const espera = Math.min(sessao.expiraEm - Date.now(), 2_147_483_647);
  timerExpiracao = setTimeout(() => encerrarSessao("expirada"), espera);
}

function carregar() {
  if (carregada) return;
  carregada = true;

  const token = lerStorage(CHAVE_TOKEN);
  sessaoAtual = montarSessao(token, lerStorage(CHAVE_TIPO));

  // Havia um token salvo, mas ele já venceu (ou está corrompido): limpa.
  if (token && !sessaoAtual) {
    limparStorage();
    ultimoMotivo = "expirada";
  }
  agendarExpiracao(sessaoAtual);
}

function limparStorage() {
  try {
    window.localStorage.removeItem(CHAVE_TOKEN);
    window.localStorage.removeItem(CHAVE_TIPO);
  } catch {
    // localStorage indisponível (ex.: modo privado restrito): nada a limpar.
  }
}

function inscrever(ouvinte: () => void) {
  carregar();
  ouvintes.add(ouvinte);

  // Mantém várias abas sincronizadas: logout em uma desloga as outras.
  const aoMudarStorage = (evento: StorageEvent) => {
    if (evento.key !== CHAVE_TOKEN && evento.key !== CHAVE_TIPO && evento.key !== null) return;
    sessaoAtual = montarSessao(lerStorage(CHAVE_TOKEN), lerStorage(CHAVE_TIPO));
    agendarExpiracao(sessaoAtual);
    avisar();
  };
  window.addEventListener("storage", aoMudarStorage);

  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

function lerSessao(): Sessao | null {
  carregar();
  return sessaoAtual;
}

/**
 * No servidor não existe localStorage. "undefined" significa
 * "ainda não sei se há sessão" (os componentes mostram carregando).
 */
function lerSessaoNoServidor(): undefined {
  return undefined;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Sessão atual para componentes React.
 * - undefined: ainda carregando (primeira renderização)
 * - null: ninguém logado
 * - Sessao: usuário logado
 */
export function useSessao(): Sessao | null | undefined {
  return useSyncExternalStore(inscrever, lerSessao, lerSessaoNoServidor);
}

/** Token atual, para as requisições autenticadas. */
export function obterToken(): string | null {
  return lerSessao()?.token ?? null;
}

/** Salva a sessão depois de um login bem-sucedido. */
export function iniciarSessao(token: string, tipo: string): Sessao {
  const sessao = montarSessao(token, tipo);
  if (!sessao) {
    throw new Error("A API devolveu um token inválido.");
  }

  try {
    window.localStorage.setItem(CHAVE_TOKEN, token);
    window.localStorage.setItem(CHAVE_TIPO, tipo);
  } catch {
    // Sem localStorage a sessão vale só enquanto a aba estiver aberta.
  }

  carregada = true;
  sessaoAtual = sessao;
  ultimoMotivo = null;
  agendarExpiracao(sessao);
  avisar();
  return sessao;
}

/** Apaga o token (logout ou sessão expirada) e avisa os componentes. */
export function encerrarSessao(motivo: MotivoSaida = "logout") {
  clearTimeout(timerExpiracao);
  limparStorage();
  carregada = true;
  sessaoAtual = null;
  ultimoMotivo = motivo;
  avisar();
}

/** Motivo do último encerramento de sessão (limpo no próximo login). */
export function motivoUltimaSaida(): MotivoSaida | null {
  carregar();
  return ultimoMotivo;
}

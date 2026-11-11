"use client";

import { encerrarSessao, obterToken } from "./auth";

/**
 * Endereço da API Spring. Variáveis usadas no navegador precisam do
 * prefixo NEXT_PUBLIC_ (veja frontend/.env.example).
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** Erro já traduzido para uma mensagem que pode ser mostrada na tela. */
export class ApiError extends Error {
  constructor(
    /** Status HTTP (0 quando nem foi possível conectar). */
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface Opcoes {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** true = envia o token (rota protegida). */
  autenticado?: boolean;
  signal?: AbortSignal;
}

/** Lê o campo "message" que o Spring coloca no JSON de erro, se houver. */
async function mensagemDoBackend(resposta: Response): Promise<string | undefined> {
  try {
    const corpo: unknown = await resposta.json();
    if (typeof corpo === "object" && corpo !== null && "message" in corpo) {
      const mensagem = (corpo as { message: unknown }).message;
      if (typeof mensagem === "string" && mensagem.trim() && !/^\d{3} [A-Z_]+$/.test(mensagem)) {
        return mensagem;
      }
    }
  } catch {
    // Corpo vazio ou que não é JSON: usa a mensagem padrão.
  }
  return undefined;
}

/** Converte a resposta de erro da API em uma mensagem clara (nunca em JSON). */
async function traduzirErro(resposta: Response, autenticado: boolean): Promise<ApiError> {
  const doBackend = await mensagemDoBackend(resposta);
  const { status } = resposta;

  if (status === 401) {
    if (autenticado) {
      // Token expirado ou inválido: apaga o token; as telas protegidas
      // percebem a sessão vazia e levam ao login.
      encerrarSessao("expirada");
      return new ApiError(401, "Sua sessão expirou. Faça login novamente.");
    }
    return new ApiError(401, doBackend ?? "Não autorizado.");
  }
  if (status === 403) {
    return new ApiError(403, "Acesso negado: seu perfil não tem permissão para esta ação.");
  }
  if (status === 404) {
    return new ApiError(404, doBackend ?? "O item procurado não foi encontrado.");
  }
  if (status === 409) {
    return new ApiError(409, doBackend ?? "A operação não é permitida pelas regras do sistema.");
  }
  if (status === 400) {
    return new ApiError(400, doBackend ?? "Os dados enviados são inválidos.");
  }
  if (status >= 500) {
    return new ApiError(status, "O servidor encontrou um erro. Tente novamente em instantes.");
  }
  return new ApiError(status, doBackend ?? `Não foi possível concluir a operação (erro ${status}).`);
}

/** Chamada central à API: monta a URL, envia o token e trata os erros. */
export async function apiFetch<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const { method = "GET", body, autenticado = false, signal } = opcoes;
  const headers: Record<string, string> = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (autenticado) {
    const token = obterToken();
    if (!token) {
      encerrarSessao("expirada");
      throw new ApiError(401, "Sua sessão expirou. Faça login novamente.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal,
    });
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === "AbortError") throw erro;
    throw new ApiError(
      0,
      "Não foi possível conectar ao servidor. Verifique se a API está em execução.",
    );
  }

  if (!resposta.ok) {
    throw await traduzirErro(resposta, autenticado);
  }

  if (resposta.status === 204 || resposta.headers.get("Content-Length") === "0") {
    return undefined as T;
  }

  try {
    return (await resposta.json()) as T;
  } catch {
    throw new ApiError(resposta.status, "A API retornou uma resposta em formato inesperado.");
  }
}

/** Mensagem amigável para qualquer erro capturado num try/catch. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) return erro.message;
  return "Algo deu errado. Tente novamente.";
}

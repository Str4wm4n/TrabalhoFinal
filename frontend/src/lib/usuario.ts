import { apiFetch } from "./api";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: "ADMIN" | "USER";
}

/** GET /me — dados de quem está logado (requisição com o token). */
export function buscarMeuPerfil(signal?: AbortSignal) {
  return apiFetch<Usuario>("/me", { autenticado: true, signal });
}

/** GET /users — só ADMIN. */
export function listarUsuarios(signal?: AbortSignal) {
  return apiFetch<Usuario[]>("/users", { autenticado: true, signal });
}

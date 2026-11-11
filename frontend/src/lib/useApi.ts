"use client";

import { useEffect, useState } from "react";
import { mensagemDeErro } from "./api";

type Estado<T> =
  | { chave: string; dados: T; erro?: undefined }
  | { chave: string; dados?: undefined; erro: string };

/**
 * Carrega dados da API e expõe os três estados que toda tela precisa:
 * carregando, erro (mensagem amigável) e dados. Recarrega quando `chave` muda.
 */
export function useApi<T>(carregar: (signal: AbortSignal) => Promise<T>, chave = "") {
  const [tentativa, setTentativa] = useState(0);
  const chaveAtual = `${chave}#${tentativa}`;
  const [estado, setEstado] = useState<Estado<T>>();

  useEffect(() => {
    const controle = new AbortController();
    carregar(controle.signal)
      .then((dados) => setEstado({ chave: chaveAtual, dados }))
      .catch((erro: unknown) => {
        if (!controle.signal.aborted) setEstado({ chave: chaveAtual, erro: mensagemDeErro(erro) });
      });
    return () => controle.abort();
    // `carregar` costuma ser uma função nova a cada render; quem decide recarregar é a chave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveAtual]);

  const atual = estado?.chave === chaveAtual ? estado : undefined;
  return {
    carregando: !atual,
    dados: atual?.dados,
    erro: atual?.erro,
    recarregar: () => setTentativa((n) => n + 1),
  };
}

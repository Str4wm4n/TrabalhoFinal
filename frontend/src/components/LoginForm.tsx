"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiFetch, mensagemDeErro } from "@/lib/api";
import { AREA_INICIAL, iniciarSessao, useSessao, type Perfil } from "@/lib/auth";

interface RespostaLogin {
  token: string;
  tipo: string;
}

interface ErrosCampos {
  email?: string;
  senha?: string;
}

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(email: string, senha: string): ErrosCampos {
  const erros: ErrosCampos = {};
  if (!email) erros.email = "Informe o e-mail.";
  else if (!FORMATO_EMAIL.test(email)) erros.email = "Informe um e-mail válido, como nome@exemplo.com.";
  if (!senha) erros.senha = "Informe a senha.";
  return erros;
}

/**
 * Para onde ir depois do login. Só aceita caminhos internos ("/algo") que o
 * perfil pode abrir; qualquer outra coisa vai para a área inicial do perfil.
 */
function destinoDepoisDoLogin(voltar: string | null, perfil: Perfil): string {
  if (!voltar || !/^\/(?!\/)[\w\-./?=&%#]*$/.test(voltar) || voltar.startsWith("/login")) {
    return AREA_INICIAL[perfil];
  }
  if (voltar.startsWith("/admin") && perfil !== "ADMIN") return AREA_INICIAL[perfil];
  if (voltar.startsWith("/cliente") && perfil !== "USER") return AREA_INICIAL[perfil];
  return voltar;
}

const AVISOS: Record<string, string> = {
  expirada: "Sua sessão expirou. Entre novamente para continuar.",
  logout: "Você saiu da sua conta.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const sessao = useSessao();

  const [erros, setErros] = useState<ErrosCampos>({});
  const [erroLogin, setErroLogin] = useState<string>();
  const [enviando, setEnviando] = useState(false);

  const aviso = AVISOS[params.get("motivo") ?? ""];
  const voltar = params.get("voltar");

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");

    // 1) Validação no front: nem chama a API se faltar algo
    const novosErros = validar(email, senha);
    setErros(novosErros);
    setErroLogin(undefined);
    if (Object.keys(novosErros).length > 0) return;

    // 2) Chama POST /public/login
    setEnviando(true);
    try {
      const resposta = await apiFetch<RespostaLogin>("/public/login", {
        method: "POST",
        body: { email, senha },
      });
      // 3) Guarda o token e vai para a área do perfil
      const novaSessao = iniciarSessao(resposta.token, resposta.tipo);
      router.replace(destinoDepoisDoLogin(voltar, novaSessao.tipo));
    } catch (erro) {
      setErroLogin(mensagemDeErro(erro));
      setEnviando(false);
    }
  }

  if (sessao && !enviando) {
    return (
      <div className="auth-card">
        <h1>Você já está conectado.</h1>
        <p className="form-hint">Logado como {sessao.email}.</p>
        <Link className="button" href={AREA_INICIAL[sessao.tipo]}>
          Ir para {sessao.tipo === "ADMIN" ? "o painel" : "a minha área"}
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">
        <span className="eyebrow-line" />
        ÁREA DO CLIENTE E DO ADMIN
      </p>
      <h1>Entrar</h1>

      {aviso && (
        <p className="notice" role="status">
          {aviso}
        </p>
      )}

      <form className="form" onSubmit={entrar} noValidate>
        <label className="field">
          <span>E-mail</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@exemplo.com"
            aria-invalid={Boolean(erros.email)}
            aria-describedby={erros.email ? "erro-email" : undefined}
          />
          {erros.email && (
            <small id="erro-email" className="form-error">
              {erros.email}
            </small>
          )}
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            name="senha"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(erros.senha)}
            aria-describedby={erros.senha ? "erro-senha" : undefined}
          />
          {erros.senha && (
            <small id="erro-senha" className="form-error">
              {erros.senha}
            </small>
          )}
        </label>

        {erroLogin && (
          <p className="form-error form-error-box" role="alert">
            {erroLogin}
          </p>
        )}

        <button type="submit" className="button" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

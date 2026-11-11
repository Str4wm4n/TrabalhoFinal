import type { ReactNode } from "react";

/** Estados padrão de toda tela que busca dados: carregando, vazio e erro. */

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="api-message" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" /> {texto}
    </div>
  );
}

export function SemResultados({
  titulo = "Nenhum resultado encontrado.",
  children,
}: {
  titulo?: string;
  children?: ReactNode;
}) {
  return (
    <div className="api-message">
      <strong>{titulo}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function MensagemErro({
  titulo = "Não foi possível carregar.",
  mensagem,
  aoTentarNovamente,
}: {
  titulo?: string;
  mensagem: string;
  aoTentarNovamente?: () => void;
}) {
  return (
    <div className="api-message api-error" role="alert">
      <strong>{titulo}</strong>
      <p>{mensagem}</p>
      {aoTentarNovamente && (
        <button type="button" className="text-button" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

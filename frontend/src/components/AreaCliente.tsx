"use client";

import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { buscarMeuPerfil } from "@/lib/usuario";
import { Carregando, MensagemErro } from "./Feedback";

const ATALHOS = [
  { titulo: "Minhas ofertas", texto: "Acompanhe as propostas que você enviou e a situação de cada uma." },
  { titulo: "Favoritos", texto: "Guarde os imóveis de que você mais gostou para ver depois." },
  { titulo: "Contratos", texto: "Assine e acompanhe os contratos das suas ofertas aceitas." },
];

export function AreaCliente() {
  // Requisição autenticada: envia "Authorization: Bearer <token>"
  const { carregando, dados: usuario, erro, recarregar } = useApi(buscarMeuPerfil, "me");

  if (carregando) return <Carregando texto="Carregando seus dados..." />;
  if (erro || !usuario) {
    return <MensagemErro titulo="Não foi possível carregar seus dados." mensagem={erro ?? ""} aoTentarNovamente={recarregar} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          Minha área · Teto &amp; Tretas
        </p>
        <h1>Olá, {usuario.nome.split(" ")[0]}.</h1>
        <p className="form-hint">Que bom ter você na Teto &amp; Tretas. Conectado como {usuario.email}.</p>
      </div>

      <div className="tile-grid">
        {ATALHOS.map((atalho) => (
          <div key={atalho.titulo} className="tile tile-soon">
            <span className="tile-badge">Próxima etapa</span>
            <h2>{atalho.titulo}</h2>
            <p>{atalho.texto}</p>
          </div>
        ))}
      </div>

      <Link className="button" href="/#imoveis">
        Explorar imóveis
      </Link>
    </div>
  );
}

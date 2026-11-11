"use client";

import { apiFetch } from "@/lib/api";
import { ehDisponivel, type Bairro, type Imovel } from "@/lib/imovel";
import { useApi } from "@/lib/useApi";
import { buscarMeuPerfil, listarUsuarios } from "@/lib/usuario";
import { Carregando, MensagemErro } from "./Feedback";

async function carregarPainel(signal: AbortSignal) {
  // As quatro chamadas saem ao mesmo tempo; /me e /users exigem o token
  const [eu, imoveis, usuarios, bairros] = await Promise.all([
    buscarMeuPerfil(signal),
    apiFetch<Imovel[]>("/imoveis", { signal }),
    listarUsuarios(signal),
    apiFetch<Bairro[]>("/bairros", { signal }),
  ]);
  return {
    nome: eu.nome,
    totais: [
      { rotulo: "Imóveis cadastrados", valor: imoveis.length },
      { rotulo: "Imóveis disponíveis", valor: imoveis.filter(ehDisponivel).length },
      { rotulo: "Clientes", valor: usuarios.filter((u) => u.tipo === "USER").length },
      { rotulo: "Bairros", valor: bairros.length },
    ],
  };
}

const PROXIMAS = ["Imóveis", "Bairros", "Tipos de imóveis", "Fotos", "Usuários", "Ofertas", "Contratos"];

export function PainelAdmin() {
  const { carregando, dados, erro, recarregar } = useApi(carregarPainel, "painel");

  if (carregando) return <Carregando texto="Carregando o painel..." />;
  if (erro || !dados) {
    return <MensagemErro titulo="Não foi possível carregar o painel." mensagem={erro ?? ""} aoTentarNovamente={recarregar} />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          PAINEL DO ADMINISTRADOR
        </p>
        <h1>Olá, {dados.nome.split(" ")[0]}.</h1>
      </div>

      <div className="stat-grid">
        {dados.totais.map((total) => (
          <div key={total.rotulo} className="stat">
            <strong>{total.valor}</strong>
            <span>{total.rotulo}</span>
          </div>
        ))}
      </div>

      <div className="tile tile-soon">
        <span className="tile-badge">Próximas etapas</span>
        <h2>Gestão</h2>
        <ul className="property-details">
          {PROXIMAS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

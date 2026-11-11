"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, mensagemDeErro } from "@/lib/api";
import { useSessao } from "@/lib/auth";
import {
  buscarImovel,
  ehDisponivel,
  enderecoCompleto,
  formatarArea,
  formatarPreco,
  rotuloFinalidade,
  rotuloStatus,
  type Imovel,
} from "@/lib/imovel";
import { Carregando, MensagemErro } from "./Feedback";
import { IconArrowLeft, IconMail, IconPin } from "./Icons";
import { HouseIllustration } from "./PropertyCard";

const EMAIL_IMOBILIARIA = process.env.NEXT_PUBLIC_CONTATO_EMAIL ?? "contato@tetoetretas.com.br";

/** Link mailto: com assunto e corpo já preenchidos com os dados do imóvel. */
function linkContato(imovel: Imovel): string {
  const tipo = imovel.tipoImovel?.nome ?? "Imóvel";
  const bairro = imovel.bairro?.nome ?? "bairro não informado";
  const valor = formatarPreco(imovel);
  const assunto = `Interesse no imóvel cód. ${imovel.id} — ${tipo} no ${bairro}`;
  const corpo = [
    "Olá! Tenho interesse neste imóvel e gostaria de mais informações.",
    "",
    `Código: ${imovel.id}`,
    `Imóvel: ${imovel.titulo}`,
    `Tipo: ${tipo}`,
    `Bairro: ${bairro}`,
    `Finalidade: ${rotuloFinalidade(imovel)}`,
    `Valor: ${valor}`,
    "",
    "Aguardo retorno.",
  ].join("\n");
  return `mailto:${EMAIL_IMOBILIARIA}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

type Resultado =
  | { chave: string; imovel: Imovel; erro?: undefined; status?: undefined }
  | { chave: string; imovel?: undefined; erro: string; status: number };

export function ImovelDetalhe() {
  const { id } = useParams<{ id: string }>();
  const sessao = useSessao();
  const [tentativa, setTentativa] = useState(0);
  const idValido = /^\d+$/.test(id);
  const chave = `${id}#${tentativa}`;

  const [resultado, setResultado] = useState<Resultado>();
  useEffect(() => {
    if (!idValido) return;
    const controle = new AbortController();
    buscarImovel(id, controle.signal)
      .then((imovel) => setResultado({ chave, imovel }))
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return;
        setResultado({
          chave,
          erro: mensagemDeErro(erro),
          status: erro instanceof ApiError ? erro.status : 0,
        });
      });
    return () => controle.abort();
  }, [chave, id, idValido]);

  const voltar = (
    <Link className="back-link" href="/#imoveis">
      <IconArrowLeft /> Voltar para a vitrine
    </Link>
  );

  if (!idValido || resultado?.status === 404) {
    return (
      <>
        {voltar}
        <div className="api-message api-error" role="alert">
          <strong>Imóvel não encontrado.</strong>
          <p>O imóvel que você procura não existe ou foi removido.</p>
        </div>
      </>
    );
  }

  if (resultado?.chave !== chave) {
    return <Carregando texto="Carregando imóvel..." />;
  }

  if (!resultado.imovel) {
    return (
      <>
        {voltar}
        <MensagemErro
          titulo="Não foi possível carregar o imóvel."
          mensagem={resultado.erro}
          aoTentarNovamente={() => setTentativa((n) => n + 1)}
        />
      </>
    );
  }

  const { imovel } = resultado;
  const ficha = [
    ["Tipo", imovel.tipoImovel?.nome],
    ["Finalidade", rotuloFinalidade(imovel)],
    ["Quartos", imovel.dormitorios],
    ["Banheiros", imovel.banheiros],
    ["Vagas de garagem", imovel.garagem],
    ["Área total", formatarArea(imovel.areaTotal)],
    ["Área construída", formatarArea(imovel.areaConstruida)],
    ["CEP", imovel.cep],
  ].filter(([, valor]) => valor != null && valor !== "") as [string, string | number][];

  const caracteristicas = (imovel.caracteristicas ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const disponivel = ehDisponivel(imovel);

  return (
    <article className="detail">
      {voltar}

      <div className="detail-grid">
        <div className="detail-art property-art property-art-1">
          <span className="property-type">{imovel.tipoImovel?.nome || "Imóvel"}</span>
          {imovel.destaque && <span className="featured-label">Destaque</span>}
          <HouseIllustration />
          <span className="art-index">Cód. {imovel.id}</span>
        </div>

        <div className="detail-summary">
          <div className="property-heading">
            <span className="purpose-label">{rotuloFinalidade(imovel)}</span>
            <span className={`status-label ${disponivel ? "" : "status-unavailable"}`}>
              {rotuloStatus(imovel)}
            </span>
          </div>
          <h1>{imovel.titulo}</h1>
          <p className="property-address">
            <IconPin size={16} />
            {enderecoCompleto(imovel)}
          </p>

          <div className="detail-price">
            <span>Valor</span>
            <strong>{formatarPreco(imovel)}</strong>
          </div>

          <div className="detail-actions">
            <a className="button" href={linkContato(imovel)}>
              <IconMail /> Entrar em contato
            </a>
            {/* Regra de negócio: só imóveis disponíveis recebem ofertas */}
            {disponivel && sessao === null && (
              <Link className="button button-outline" href={`/login?voltar=/imoveis/${imovel.id}`}>
                Entrar para fazer uma oferta
              </Link>
            )}
            {disponivel && sessao?.tipo === "USER" && (
              <p className="form-hint">Em breve você poderá enviar sua proposta por aqui.</p>
            )}
          </div>
          {!disponivel && (
            <p className="form-hint">Este imóvel está {rotuloStatus(imovel).toLowerCase()} e não recebe novas ofertas.</p>
          )}
        </div>
      </div>

      <div className="detail-body">
        <section>
          <h2>Sobre o imóvel</h2>
          <p>{imovel.descricao || "Sem descrição."}</p>
          {caracteristicas.length > 0 && (
            <ul className="property-details">
              {caracteristicas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Ficha técnica</h2>
          <dl className="detail-facts">
            {ficha.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </article>
  );
}

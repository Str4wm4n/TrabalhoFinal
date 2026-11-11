"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { mensagemDeErro } from "@/lib/api";
import {
  buscarVitrine,
  listarBairros,
  type Bairro,
  type FiltrosVitrine,
  type Finalidade,
  type Imovel,
  type Ordem,
  type Pagina,
} from "@/lib/imovel";
import { Carregando, MensagemErro, SemResultados } from "./Feedback";
import { IconSearch } from "./Icons";
import { PropertyCard } from "./PropertyCard";

/** Lê os filtros da URL. Na URL a página começa em 1 (mais natural); na API, em 0. */
function filtrosDaUrl(params: URLSearchParams): FiltrosVitrine {
  const finalidade = params.get("finalidade");
  const ordem = params.get("ordem");
  const pagina = Number(params.get("pagina"));
  return {
    bairroId: params.get("bairroId") ?? "",
    finalidade: finalidade === "venda" || finalidade === "aluguel" ? finalidade : "",
    precoMin: params.get("precoMin") ?? "",
    precoMax: params.get("precoMax") ?? "",
    ordem: ordem === "preco_asc" || ordem === "preco_desc" ? ordem : "",
    pagina: Number.isInteger(pagina) && pagina > 1 ? pagina - 1 : 0,
  };
}

function urlDosFiltros(filtros: FiltrosVitrine): string {
  const params = new URLSearchParams();
  for (const campo of ["bairroId", "finalidade", "precoMin", "precoMax", "ordem"] as const) {
    const valor = filtros[campo];
    if (valor) params.set(campo, valor);
  }
  if (filtros.pagina) params.set("pagina", String(filtros.pagina + 1));
  const texto = params.toString();
  return texto ? `?${texto}` : "";
}

/** Valida o preço digitado: vazio ou número >= 0. Devolve a mensagem de erro, se houver. */
function validarPreco(valor: string, rotulo: string): string | undefined {
  if (valor === "") return undefined;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return `${rotulo}: informe um número válido.`;
  if (numero < 0) return `${rotulo}: o valor não pode ser negativo.`;
  return undefined;
}

type Resultado =
  | { chave: string; dados: Pagina<Imovel>; erro?: undefined }
  | { chave: string; dados?: undefined; erro: string };

export function Vitrine() {
  const router = useRouter();
  const caminho = usePathname();
  const searchParams = useSearchParams();
  const secaoRef = useRef<HTMLDivElement>(null);

  const filtros = filtrosDaUrl(new URLSearchParams(searchParams.toString()));
  const [tentativa, setTentativa] = useState(0);
  const chave = `${urlDosFiltros(filtros)}#${tentativa}`;

  // ---- imóveis: busca sempre que os filtros da URL mudam ----
  const [resultado, setResultado] = useState<Resultado>();
  useEffect(() => {
    const controle = new AbortController();
    buscarVitrine(filtrosDaUrl(new URLSearchParams(chave.split("#")[0])), controle.signal)
      .then((dados) => setResultado({ chave, dados }))
      .catch((erro: unknown) => {
        if (!controle.signal.aborted) setResultado({ chave, erro: mensagemDeErro(erro) });
      });
    // Se os filtros mudarem antes da resposta chegar, cancela a busca antiga.
    return () => controle.abort();
  }, [chave]);
  const carregando = resultado?.chave !== chave;

  // ---- bairros para o filtro (carrega uma vez) ----
  const [bairros, setBairros] = useState<Bairro[]>();
  const [erroBairros, setErroBairros] = useState<string>();
  useEffect(() => {
    const controle = new AbortController();
    listarBairros(controle.signal)
      .then((lista) => setBairros([...lista].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))))
      .catch((erro: unknown) => {
        if (!controle.signal.aborted) setErroBairros(mensagemDeErro(erro));
      });
    return () => controle.abort();
  }, []);

  const [erroFormulario, setErroFormulario] = useState<string>();

  function navegar(novos: FiltrosVitrine, rolar = false) {
    router.push(`${caminho}${urlDosFiltros(novos)}`, { scroll: false });
    if (rolar) secaoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function aplicarFiltros(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const precoMin = String(dados.get("precoMin") ?? "").trim();
    const precoMax = String(dados.get("precoMax") ?? "").trim();

    const erro =
      validarPreco(precoMin, "Preço mínimo") ??
      validarPreco(precoMax, "Preço máximo") ??
      (precoMin && precoMax && Number(precoMin) > Number(precoMax)
        ? "O preço mínimo não pode ser maior que o máximo."
        : undefined);
    setErroFormulario(erro);
    if (erro) return;

    navegar({
      bairroId: String(dados.get("bairroId") ?? ""),
      finalidade: String(dados.get("finalidade") ?? "") as Finalidade | "",
      precoMin,
      precoMax,
      ordem: filtros.ordem,
      pagina: 0, // filtro novo sempre volta para a primeira página
    });
  }

  function limparFiltros() {
    setErroFormulario(undefined);
    navegar({ ordem: filtros.ordem });
  }

  const temFiltro = Boolean(filtros.bairroId || filtros.finalidade || filtros.precoMin || filtros.precoMax);
  const pagina = resultado?.dados;

  return (
    <div ref={secaoRef} className="vitrine">
      {/* key: quando a URL muda (ex.: botão voltar), o formulário recomeça com os valores dela */}
      <form key={urlDosFiltros(filtros)} className="filters" onSubmit={aplicarFiltros} noValidate>
        <label className="field">
          <span>Bairro</span>
          <select name="bairroId" defaultValue={filtros.bairroId} disabled={!bairros}>
            <option value="">{bairros ? "Todos os bairros" : erroBairros ? "Indisponível" : "Carregando..."}</option>
            {bairros?.map((bairro) => (
              <option key={bairro.id} value={bairro.id}>
                {bairro.nome}
                {bairro.cidade ? ` · ${bairro.cidade}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Finalidade</span>
          <select name="finalidade" defaultValue={filtros.finalidade}>
            <option value="">Venda e aluguel</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>
        </label>

        <label className="field">
          <span>Preço mínimo (R$)</span>
          <input name="precoMin" type="number" inputMode="numeric" min={0} step="any"
            placeholder="0" defaultValue={filtros.precoMin} />
        </label>

        <label className="field">
          <span>Preço máximo (R$)</span>
          <input name="precoMax" type="number" inputMode="numeric" min={0} step="any"
            placeholder="Sem limite" defaultValue={filtros.precoMax} />
        </label>

        <div className="filter-actions">
          <button type="submit" className="button">
            <IconSearch /> Filtrar
          </button>
          {temFiltro && (
            <button type="button" className="text-button" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>

        {erroFormulario && (
          <p className="form-error filters-error" role="alert">{erroFormulario}</p>
        )}
        {erroBairros && (
          <p className="form-hint filters-error">Não foi possível carregar os bairros: {erroBairros}</p>
        )}
      </form>

      <div className="results-bar">
        <p aria-live="polite">
          {carregando
            ? "Buscando imóveis..."
            : pagina
              ? pagina.totalElementos === 0
                ? "Nenhum imóvel encontrado"
                : `Mostrando ${pagina.pagina * pagina.tamanho + 1}–${pagina.pagina * pagina.tamanho + pagina.conteudo.length} de ${pagina.totalElementos} ${pagina.totalElementos === 1 ? "imóvel" : "imóveis"}`
              : ""}
        </p>
        <label className="field field-inline">
          <span>Ordenar por</span>
          <select
            value={filtros.ordem}
            onChange={(evento) => navegar({ ...filtros, ordem: evento.target.value as Ordem | "", pagina: 0 })}
          >
            <option value="">Destaques</option>
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
          </select>
        </label>
      </div>

      {carregando ? (
        <Carregando texto="Carregando imóveis..." />
      ) : resultado?.erro ? (
        <MensagemErro
          titulo="Não foi possível carregar os imóveis."
          mensagem={resultado.erro}
          aoTentarNovamente={() => setTentativa((n) => n + 1)}
        />
      ) : pagina && pagina.conteudo.length === 0 ? (
        <SemResultados titulo={temFiltro ? "Nenhum imóvel com esses filtros." : "Nenhum imóvel disponível no momento."}>
          {temFiltro ? "Tente ampliar a faixa de preço ou escolher outro bairro." : "Volte em breve: novos imóveis chegam sempre."}
        </SemResultados>
      ) : pagina ? (
        <>
          <div className="property-grid">
            {pagina.conteudo.map((imovel, index) => (
              <PropertyCard key={imovel.id} imovel={imovel} index={index} />
            ))}
          </div>
          <Paginacao
            pagina={pagina.pagina}
            totalPaginas={pagina.totalPaginas}
            aoMudar={(nova) => navegar({ ...filtros, pagina: nova }, true)}
          />
        </>
      ) : null}
    </div>
  );
}

function Paginacao({
  pagina,
  totalPaginas,
  aoMudar,
}: {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginação dos imóveis">
      <button type="button" disabled={pagina === 0} onClick={() => aoMudar(pagina - 1)}>
        ← Anterior
      </button>
      <ol>
        {Array.from({ length: totalPaginas }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              aria-current={i === pagina ? "page" : undefined}
              aria-label={`Página ${i + 1}`}
              onClick={() => aoMudar(i)}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" disabled={pagina >= totalPaginas - 1} onClick={() => aoMudar(pagina + 1)}>
        Próxima →
      </button>
    </nav>
  );
}

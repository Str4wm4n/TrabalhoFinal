import { apiFetch } from "./api";

export interface Bairro {
  id: number;
  nome: string;
  cidade?: string | null;
  estado?: string | null;
}

export interface TipoImovel {
  id: number;
  nome: string;
}

export interface Imovel {
  id: number;
  titulo: string;
  descricao?: string | null;
  precoVenda?: number | null;
  precoAluguel?: number | null;
  finalidade?: string | null;
  status?: string | null;
  dormitorios?: number | null;
  banheiros?: number | null;
  garagem?: number | null;
  areaTotal?: number | null;
  areaConstruida?: number | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  cep?: string | null;
  caracteristicas?: string | null;
  destaque?: boolean | null;
  tipoImovel?: TipoImovel | null;
  bairro?: Bairro | null;
}

/** Formato de página devolvido por GET /imoveis/busca (pagina começa em 0). */
export interface Pagina<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}

export type Finalidade = "venda" | "aluguel";
export type Ordem = "preco_asc" | "preco_desc";

export interface FiltrosVitrine {
  bairroId?: string;
  finalidade?: Finalidade | "";
  precoMin?: string;
  precoMax?: string;
  ordem?: Ordem | "";
  pagina?: number;
}

export const TAMANHO_PAGINA = 6;

// ---------------------------------------------------------------------------
// Chamadas à API (todas públicas)
// ---------------------------------------------------------------------------

export function buscarVitrine(filtros: FiltrosVitrine, signal?: AbortSignal) {
  const parametros = new URLSearchParams({
    pagina: String(filtros.pagina ?? 0),
    tamanho: String(TAMANHO_PAGINA),
  });
  for (const campo of ["bairroId", "finalidade", "precoMin", "precoMax", "ordem"] as const) {
    const valor = filtros[campo];
    if (valor) parametros.set(campo, valor);
  }
  return apiFetch<Pagina<Imovel>>(`/imoveis/busca?${parametros}`, { signal });
}

export function buscarImovel(id: string, signal?: AbortSignal) {
  return apiFetch<Imovel>(`/imoveis/${encodeURIComponent(id)}`, { signal });
}

export function listarBairros(signal?: AbortSignal) {
  return apiFetch<Bairro[]>("/bairros", { signal });
}

// ---------------------------------------------------------------------------
// Formatação para a tela
// ---------------------------------------------------------------------------

export function ehAluguel(imovel: Imovel): boolean {
  return (imovel.finalidade ?? "").toLocaleLowerCase("pt-BR").includes("alug");
}

export function ehDisponivel(imovel: Imovel): boolean {
  return (imovel.status ?? "").toLocaleLowerCase("pt-BR") === "disponivel";
}

/** Valor do imóvel conforme a finalidade: aluguel ou venda. */
export function precoDoImovel(imovel: Imovel): number | undefined {
  const preco = ehAluguel(imovel)
    ? (imovel.precoAluguel ?? imovel.precoVenda)
    : (imovel.precoVenda ?? imovel.precoAluguel);
  const numero = preco == null ? NaN : Number(preco);
  return Number.isFinite(numero) ? numero : undefined;
}

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

export function formatarPreco(imovel: Imovel): string {
  const preco = precoDoImovel(imovel);
  if (preco === undefined) return "Consulte o valor";
  return ehAluguel(imovel) ? `${formatarMoeda(preco)}/mês` : formatarMoeda(preco);
}

export function rotuloFinalidade(imovel: Imovel): string {
  const finalidade = (imovel.finalidade ?? "").toLocaleLowerCase("pt-BR");
  if (finalidade.includes("alug")) return "Para alugar";
  if (finalidade.includes("vend")) return "À venda";
  return imovel.finalidade || "Imóvel";
}

const ROTULOS_STATUS: Record<string, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  alugado: "Alugado",
  vendido: "Vendido",
};

export function rotuloStatus(imovel: Imovel): string {
  const status = (imovel.status ?? "").toLocaleLowerCase("pt-BR");
  return ROTULOS_STATUS[status] ?? (imovel.status || "Consulte");
}

export function localizacao(imovel: Imovel): string {
  return [imovel.bairro?.nome, imovel.bairro?.cidade].filter(Boolean).join(" · ");
}

export function enderecoCompleto(imovel: Imovel): string {
  const rua = [imovel.endereco, imovel.numero, imovel.complemento].filter(Boolean).join(", ");
  return [rua, localizacao(imovel)].filter(Boolean).join(" — ") || "Endereço não informado";
}

export function formatarArea(valor?: number | null): string | undefined {
  if (valor == null) return undefined;
  return `${new Intl.NumberFormat("pt-BR").format(Number(valor))} m²`;
}

/** "1 quarto" / "3 quartos" */
export function plural(quantidade: number, singular: string, pluralTexto: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;
}

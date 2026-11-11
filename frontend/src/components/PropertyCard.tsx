import Link from "next/link";
import { IconArea, IconBath, IconBed, IconPin } from "./Icons";
import {
  ehDisponivel,
  formatarArea,
  formatarPreco,
  localizacao,
  plural,
  rotuloFinalidade,
  rotuloStatus,
  type Imovel,
} from "@/lib/imovel";

export function HouseIllustration({ className = "house-illustration" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <path d="M37 78 120 19l83 59v67H37V78Z" />
      <path d="M99 145V94h42v51M62 88h28v26H62zM151 88h28v26h-28z" />
    </svg>
  );
}

export function PropertyCard({ imovel, index }: { imovel: Imovel; index: number }) {
  const area = formatarArea(imovel.areaTotal);
  const detalhes = [
    imovel.dormitorios != null && { icone: IconBed, texto: plural(imovel.dormitorios, "quarto", "quartos") },
    imovel.banheiros != null && { icone: IconBath, texto: plural(imovel.banheiros, "banheiro", "banheiros") },
    area && { icone: IconArea, texto: area },
  ].filter((detalhe): detalhe is { icone: typeof IconBed; texto: string } => Boolean(detalhe));

  return (
    <Link className="property-card" href={`/imoveis/${imovel.id}`}>
      <div className={`property-art property-art-${(index % 3) + 1}`}>
        <span className="property-type">{imovel.tipoImovel?.nome || "Imóvel"}</span>
        {imovel.destaque && <span className="featured-label">Destaque</span>}
        <HouseIllustration />
        <span className="art-index">Cód. {imovel.id}</span>
      </div>
      <div className="property-content">
        <div className="property-heading">
          <span className="purpose-label">{rotuloFinalidade(imovel)}</span>
          <span className={`status-label${ehDisponivel(imovel) ? "" : " status-unavailable"}`}>
            {rotuloStatus(imovel)}
          </span>
        </div>
        <h3>{imovel.titulo}</h3>
        <p className="property-address">
          <IconPin size={15} />
          {localizacao(imovel) || "Localização não informada"}
        </p>
        {detalhes.length > 0 && (
          <ul className="property-details" aria-label="Características">
            {detalhes.map(({ icone: Icone, texto }) => (
              <li key={texto}>
                <Icone size={15} />
                {texto}
              </li>
            ))}
          </ul>
        )}
        <div className="property-price">
          <span>Valor</span>
          <strong>{formatarPreco(imovel)}</strong>
        </div>
      </div>
    </Link>
  );
}

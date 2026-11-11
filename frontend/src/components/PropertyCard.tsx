import Link from "next/link";
import {
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
  const detalhes = [
    imovel.dormitorios != null && plural(imovel.dormitorios, "quarto", "quartos"),
    imovel.banheiros != null && plural(imovel.banheiros, "banheiro", "banheiros"),
    formatarArea(imovel.areaTotal),
  ].filter((detalhe): detalhe is string => Boolean(detalhe));

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
          <span className="status-label">{rotuloStatus(imovel)}</span>
        </div>
        <h3>{imovel.titulo}</h3>
        <p className="property-address">{localizacao(imovel) || "Localização não informada"}</p>
        {detalhes.length > 0 && (
          <ul className="property-details" aria-label="Características">
            {detalhes.map((detalhe) => (
              <li key={detalhe}>{detalhe}</li>
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

import { Suspense } from "react";
import { ApiError, getImoveis, type Imovel } from "@/lib/api";

function getPrice(imovel: Imovel): number | undefined {
  const purpose = imovel.finalidade?.toLocaleLowerCase("pt-BR") ?? "";
  const preferredPrice = purpose.includes("alug")
    ? imovel.precoAluguel ?? imovel.precoVenda
    : imovel.precoVenda ?? imovel.precoAluguel;

  if (preferredPrice === null || preferredPrice === undefined) {
    return undefined;
  }

  const price =
    typeof preferredPrice === "number" ? preferredPrice : Number(preferredPrice);

  return Number.isFinite(price) ? price : undefined;
}

function formatPrice(imovel: Imovel): string {
  const price = getPrice(imovel);

  if (price === undefined) {
    return "Consulte o valor";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(price);
}

function getAddress(imovel: Imovel): string {
  const street = [imovel.endereco, imovel.numero].filter(Boolean).join(", ");
  const neighborhood = imovel.bairro?.nome;
  const city = imovel.bairro?.cidade;
  const location = [neighborhood, city].filter(Boolean).join(" · ");

  return [street, location].filter(Boolean).join(" — ") || "Endereço não informado";
}

function getPurpose(imovel: Imovel): string {
  const purpose = imovel.finalidade?.toLocaleLowerCase("pt-BR") ?? "";

  if (purpose.includes("alug")) {
    return "Para alugar";
  }

  if (purpose.includes("vend")) {
    return "À venda";
  }

  return imovel.finalidade || "Imóvel";
}

function PropertyCard({ imovel, index }: { imovel: Imovel; index: number }) {
  const details = [
    imovel.dormitorios != null && `${imovel.dormitorios} quartos`,
    imovel.banheiros != null && `${imovel.banheiros} banheiros`,
    imovel.areaTotal != null && `${imovel.areaTotal} m²`,
  ].filter((detail): detail is string => Boolean(detail));

  return (
    <article className="property-card">
      <div className={`property-art property-art-${(index % 3) + 1}`}>
        <span className="property-type">
          {imovel.tipoImovel?.nome || "Imóvel"}
        </span>
        {imovel.destaque && <span className="featured-label">Destaque</span>}
        <svg
          className="house-illustration"
          viewBox="0 0 240 160"
          fill="none"
          aria-hidden="true"
        >
          <path d="M37 78 120 19l83 59v67H37V78Z" />
          <path d="M99 145V94h42v51M62 88h28v26H62zM151 88h28v26h-28z" />
        </svg>
        <span className="art-index">0{index + 1}</span>
      </div>
      <div className="property-content">
        <div className="property-heading">
          <span className="purpose-label">{getPurpose(imovel)}</span>
          <span className="status-label">
            {imovel.status?.toLocaleLowerCase("pt-BR") === "disponivel"
              ? "Disponível"
              : imovel.status || "Consulte"}
          </span>
        </div>
        <h3>{imovel.titulo}</h3>
        <p className="property-address">{getAddress(imovel)}</p>
        {details.length > 0 && (
          <ul className="property-details" aria-label="Características">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        )}
        <div className="property-price">
          <span>Valor</span>
          <strong>{formatPrice(imovel)}</strong>
        </div>
      </div>
    </article>
  );
}

async function PropertyListings() {
  let imoveis: Imovel[] = [];
  let apiError: string | undefined;

  try {
    imoveis = await getImoveis();
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    apiError = error.message;
  }

  if (apiError) {
    return (
      <div className="api-message api-error" role="alert">
        <strong>Não foi possível carregar os imóveis.</strong>
        <p>{apiError}</p>
        <p>
          Confira se a API Java está em execução e se a variável{" "}
          <code>API_URL</code> aponta para ela.
        </p>
      </div>
    );
  }

  if (imoveis.length === 0) {
    return (
      <div className="api-message">
        <strong>Seu próximo endereço ainda não chegou.</strong>
        <p>Não há imóveis cadastrados para exibir no momento.</p>
      </div>
    );
  }

  return (
    <div className="property-grid">
      {imoveis.map((imovel, index) => (
        <PropertyCard key={imovel.id} imovel={imovel} index={index} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Casa Clara, página inicial">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            casa<span className="brand-light">clara</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#imoveis">Imóveis</a>
          <a href="#sobre">Sobre nós</a>
        </nav>
        <a className="header-link" href="#contato">
          Fale com a gente <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              SEU PRÓXIMO CAPÍTULO COMEÇA AQUI
            </p>
            <h1>
              Um lugar para
              <br />
              chamar de <em>seu.</em>
            </h1>
            <p className="hero-description">
              Encontre um endereço que combine com a vida que você quer viver.
              Boas escolhas começam com o lugar certo.
            </p>
            <a className="primary-link" href="#imoveis">
              Explorar imóveis <span aria-hidden="true">↓</span>
            </a>
            <div className="hero-note">
              <span className="note-dot" />
              Novos começos, bons endereços.
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun-shape" />
            <div className="hero-building">
              <div className="building-roof" />
              <div className="building-body">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="building-base" />
            </div>
            <div className="hero-plant plant-left">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-plant plant-right">
              <span />
              <span />
              <span />
            </div>
            <div className="hero-art-caption">ESPAÇO PARA VIVER BEM</div>
          </div>
          <div className="hero-bottom">
            <span>Encontrar. Sentir. Pertencer.</span>
            <span className="hero-count">
              API JAVA
              <small> catálogo atualizado a cada visita</small>
            </span>
          </div>
        </section>

        <section className="listing-section" id="imoveis">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                SELEÇÃO CASA CLARA
              </p>
              <h2>Espaços com potencial.</h2>
            </div>
            <p className="section-description">
              Cada imóvel é uma possibilidade. Encontre o que faz sentido para
              você.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="api-message" role="status">
                Carregando imóveis da API Java...
              </div>
            }
          >
            <PropertyListings />
          </Suspense>
        </section>

        <section className="about-section" id="sobre">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            MAIS QUE UM ENDEREÇO
          </p>
          <div className="about-content">
            <h2>
              O começo de uma
              <br />
              boa história.
            </h2>
            <p>
              A Casa Clara aproxima você de espaços onde a vida acontece. Um
              catálogo simples, direto e conectado à nossa API de imóveis.
            </p>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contato">
        <a className="brand footer-brand" href="#" aria-label="Casa Clara">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span>
            casa<span className="brand-light">clara</span>
          </span>
        </a>
        <p>Um bom lugar muda tudo.</p>
        <span className="footer-note">Projeto demonstrativo · 2026</span>
      </footer>
    </>
  );
}

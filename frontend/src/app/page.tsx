import { Suspense } from "react";
import { Carregando } from "@/components/Feedback";
import { IconSearch } from "@/components/Icons";
import { Vitrine } from "@/components/Vitrine";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Imobiliária Teto &amp; Tretas
          </p>
          <h1>
            Seu próximo teto,
            <br />
            <em>sem treta.</em>
          </h1>
          <p className="hero-description">
            Imóveis para alugar e comprar com informação clara, do primeiro
            clique até a assinatura do contrato.
          </p>
          <a className="primary-link" href="#imoveis">
            <IconSearch /> Explorar imóveis
          </a>
          <div className="hero-note">
            <span className="note-dot" />
            Catálogo atualizado a cada visita.
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
          <div className="hero-art-caption">SEU PRÓXIMO TETO</div>
        </div>
        <div className="hero-bottom">
          <span>Buscar. Visitar. Morar.</span>
          <span className="hero-count">
            Alugue ou compre
            <small>com segurança do início ao fim</small>
          </span>
        </div>
      </section>

      <section className="listing-section" id="imoveis">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Seleção Teto &amp; Tretas
            </p>
            <h2>Imóveis disponíveis</h2>
          </div>
          <p className="section-description">
            Filtre por bairro, finalidade e faixa de preço. Clique em um imóvel
            para ver todos os detalhes.
          </p>
        </div>

        {/* A vitrine lê os filtros da URL (useSearchParams), por isso fica em Suspense */}
        <Suspense fallback={<Carregando texto="Carregando imóveis..." />}>
          <Vitrine />
        </Suspense>
      </section>

      <section className="about-section" id="sobre">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          Sobre a Teto &amp; Tretas
        </p>
        <div className="about-content">
          <h2>
            Treta só no nome.
            <br />
            No resto, transparência.
          </h2>
          <p>
            A Teto &amp; Tretas conecta você a imóveis com preço, status e
            condições sempre à vista. Sem letra miúda, sem surpresa no contrato.
          </p>
        </div>
      </section>
    </main>
  );
}

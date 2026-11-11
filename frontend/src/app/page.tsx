import { Suspense } from "react";
import { Carregando } from "@/components/Feedback";
import { Vitrine } from "@/components/Vitrine";

export default function Home() {
  return (
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
  );
}

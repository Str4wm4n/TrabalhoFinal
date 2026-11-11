import { Suspense } from "react";
import { Carregando } from "@/components/Feedback";
import { ImovelDetalhe } from "@/components/ImovelDetalhe";

export default function ImovelPage() {
  return (
    <main className="page">
      {/* O id vem da URL (useParams), conhecido só na hora do acesso: fica em Suspense */}
      <Suspense fallback={<Carregando texto="Carregando imóvel..." />}>
        <ImovelDetalhe />
      </Suspense>
    </main>
  );
}

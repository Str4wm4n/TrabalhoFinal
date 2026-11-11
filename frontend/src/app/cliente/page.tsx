import type { Metadata } from "next";
import { AreaCliente } from "@/components/AreaCliente";
import { RequireRole } from "@/components/RequireRole";

export const metadata: Metadata = {
  title: "Minha área | Teto & Tretas",
};

export default function ClientePage() {
  return (
    <main className="page">
      {/* Só o perfil USER vê esta tela */}
      <RequireRole perfil="USER">
        <AreaCliente />
      </RequireRole>
    </main>
  );
}

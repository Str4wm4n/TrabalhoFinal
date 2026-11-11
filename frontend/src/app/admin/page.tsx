import type { Metadata } from "next";
import { PainelAdmin } from "@/components/PainelAdmin";
import { RequireRole } from "@/components/RequireRole";

export const metadata: Metadata = {
  title: "Painel | Teto & Tretas",
};

export default function AdminPage() {
  return (
    <main className="page">
      {/* Só o perfil ADMIN vê esta tela */}
      <RequireRole perfil="ADMIN">
        <PainelAdmin />
      </RequireRole>
    </main>
  );
}

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";
import { createOpportunity } from "./actions";

export default async function OpportunitiesPage() {
  const { supabase } = await requireUser();

  const [{ data: opportunities }, { data: accounts }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, code, name, unit_asset, segment, stage, estimated_value, probability, accounts(name)")
      .order("created_at", { ascending: false }),
    supabase.from("accounts").select("id, name").order("name"),
  ]);

  return (
    <AppShell>
      <Topbar
        title="Oportunidades"
        subtitle="Pipeline técnico-comercial com cliente, ativo, disciplina, valor e probabilidade"
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Lista de oportunidades</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Oportunidade</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Etapa</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Prob.</th>
                </tr>
              </thead>
              <tbody>
                {(opportunities ?? []).map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 bg-white">
                    <td className="px-6 py-4 font-medium text-slate-700">{item.code}</td>
                    <td className="px-6 py-4">
                      <Link href={`/oportunidades/${item.id}`} className="font-semibold text-slate-900 hover:underline">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">{item.unit_asset} • {item.segment}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{(item.accounts as { name?: string } | null)?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{item.stage}</td>
                    <td className="px-6 py-4 text-slate-600">
                      R$ {Number(item.estimated_value ?? 0).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.probability ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Nova oportunidade</h2>
          <form action={createOpportunity} className="mt-5 space-y-4">
            <input name="name" placeholder="Nome da oportunidade" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <select name="account_id" className="w-full rounded-xl border border-slate-300 px-4 py-3" required>
              <option value="">Selecione o cliente</option>
              {(accounts ?? []).map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
            <input name="unit_asset" placeholder="Unidade / ativo" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <input name="segment" placeholder="Segmento" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <input name="service_type" placeholder="Tipo de serviço" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <input name="main_discipline" placeholder="Disciplina principal" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <select name="stage" className="w-full rounded-xl border border-slate-300 px-4 py-3" required>
              {[
                "lead_identificado",
                "qualificacao_inicial",
                "entendimento_escopo",
                "go_no_go_interno",
                "em_elaboracao_proposta",
                "proposta_enviada",
                "em_negociacao",
                "aguardando_decisao_cliente",
                "ganha",
                "perdida",
                "stand_by",
              ].map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <input name="estimated_value" type="number" step="0.01" placeholder="Valor estimado" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <input name="probability" type="number" min="0" max="100" placeholder="Probabilidade (%)" className="w-full rounded-xl border border-slate-300 px-4 py-3" required />
            <button className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800">
              Criar oportunidade
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}

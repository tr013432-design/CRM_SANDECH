import { AppShell } from "@/components/app-shell";
import { KpiCard } from "@/components/kpi-card";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { supabase } = await requireUser();

  const [opportunitiesResult, proposalsResult] = await Promise.all([
    supabase.from("opportunities").select("id, stage, estimated_value, probability"),
    supabase.from("proposal_versions").select("id, proposed_value, status"),
  ]);

  const opportunities = opportunitiesResult.data ?? [];
  const proposals = proposalsResult.data ?? [];

  const pipelineValue = opportunities.reduce((sum, item) => sum + Number(item.estimated_value ?? 0), 0);
  const weightedValue = opportunities.reduce(
    (sum, item) => sum + (Number(item.estimated_value ?? 0) * Number(item.probability ?? 0)) / 100,
    0,
  );

  return (
    <AppShell>
      <Topbar
        title="Dashboard comercial"
        subtitle="Visão inicial do pipeline técnico-comercial da SANDECH"
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Oportunidades" value={String(opportunities.length)} />
        <KpiCard label="Valor total em pipeline" value={`R$ ${pipelineValue.toLocaleString("pt-BR")}`} />
        <KpiCard label="Valor ponderado" value={`R$ ${weightedValue.toLocaleString("pt-BR")}`} />
        <KpiCard label="Propostas registradas" value={String(proposals.length)} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <p className="section-title">Etapas</p>
          <div className="mt-4 space-y-3">
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
            ].map((stage) => {
              const total = opportunities.filter((item) => item.stage === stage).length;
              return (
                <div key={stage} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{stage}</span>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <p className="section-title">Recado do produto</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>
              Esta primeira versão já está preparada para oportunidades, proposta, rastreabilidade e
              follow-up.
            </p>
            <p>
              O próximo incremento recomendado é aprovação interna por alçada, checklist de TR/RFQ e
              geração de proposta por template.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

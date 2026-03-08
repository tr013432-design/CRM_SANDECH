import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Topbar } from "@/components/topbar";
import { requireUser } from "@/lib/auth";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const [{ data: opportunity }, { data: proposals }, { data: interactions }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("*, accounts(name), contacts(name, email, phone)")
      .eq("id", id)
      .single(),
    supabase
      .from("proposal_versions")
      .select("id, version_number, status, proposed_value, validity_days, delivery_deadline_days, sent_at")
      .eq("opportunity_id", id)
      .order("version_number", { ascending: false }),
    supabase
      .from("interactions")
      .select("id, interaction_type, subject, notes, interaction_at")
      .eq("opportunity_id", id)
      .order("interaction_at", { ascending: false }),
  ]);

  if (!opportunity) notFound();

  return (
    <AppShell>
      <Topbar title={opportunity.name} subtitle={`${opportunity.code} • ${opportunity.stage}`} />

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <p className="section-title">Resumo da oportunidade</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Info label="Cliente" value={(opportunity.accounts as { name?: string } | null)?.name} />
              <Info label="Unidade / ativo" value={opportunity.unit_asset} />
              <Info label="Segmento" value={opportunity.segment} />
              <Info label="Tipo de serviço" value={opportunity.service_type} />
              <Info label="Disciplina principal" value={opportunity.main_discipline} />
              <Info label="Valor estimado" value={`R$ ${Number(opportunity.estimated_value ?? 0).toLocaleString("pt-BR")}`} />
              <Info label="Probabilidade" value={`${opportunity.probability ?? 0}%`} />
              <Info label="Próximo passo" value={opportunity.next_step} />
            </div>
          </div>

          <div className="card p-6">
            <p className="section-title">Escopo e proteção comercial</p>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <Block title="Resumo do escopo" text={opportunity.scope_summary} />
              <Block title="Premissas" text={opportunity.assumptions} />
              <Block title="Fora de escopo" text={opportunity.out_of_scope} />
              <Block title="Riscos" text={opportunity.risks} />
              <Block title="Lacunas de informação" text={opportunity.information_gaps} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <p className="section-title">Propostas</p>
            <div className="mt-4 space-y-3">
              {(proposals ?? []).map((proposal) => (
                <div key={proposal.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">Versão {proposal.version_number}</p>
                  <p className="mt-1 text-sm text-slate-600">Status: {proposal.status}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Valor: R$ {Number(proposal.proposed_value ?? 0).toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <p className="section-title">Interações</p>
            <div className="mt-4 space-y-3">
              {(interactions ?? []).map((interaction) => (
                <div key={interaction.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{interaction.subject || interaction.interaction_type}</p>
                  <p className="mt-1 text-sm text-slate-600">{interaction.notes || "Sem observações"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

function Block({ title, text }: { title: string; text?: string | null }) {
  return (
    <div>
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-slate-600">{text || "Não informado."}</p>
    </div>
  );
}

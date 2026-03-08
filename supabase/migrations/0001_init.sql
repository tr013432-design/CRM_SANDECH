create extension if not exists pgcrypto;

create type public.app_role as enum (
  'admin',
  'diretoria',
  'comercial',
  'engenharia',
  'juridico',
  'financeiro',
  'viewer'
);

create type public.opportunity_stage as enum (
  'lead_identificado',
  'qualificacao_inicial',
  'entendimento_escopo',
  'go_no_go_interno',
  'em_elaboracao_proposta',
  'proposta_enviada',
  'em_negociacao',
  'aguardando_decisao_cliente',
  'ganha',
  'perdida',
  'stand_by'
);

create type public.project_phase as enum (
  'conceitual',
  'basico',
  'detalhado',
  'nao_definido'
);

create type public.loss_reason as enum (
  'preco_acima_concorrente',
  'projeto_postergado',
  'cliente_interno',
  'escopo_fora_perfil_sandech',
  'condicao_contratual_inviavel',
  'prazo_inexequivel',
  'sem_retorno_cliente',
  'sem_capacidade_interna',
  'falta_documentacao_proposta',
  'outro'
);

create type public.proposal_status as enum (
  'rascunho',
  'em_revisao_interna',
  'enviada',
  'em_negociacao',
  'aprovada',
  'rejeitada',
  'expirada'
);

create type public.interaction_type as enum (
  'email',
  'whatsapp',
  'reuniao',
  'ligacao',
  'visita_tecnica',
  'interno',
  'outro'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role public.app_role not null default 'comercial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  tax_id text,
  segment text not null,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  job_title text,
  influence_level text,
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  account_id uuid not null references public.accounts(id) on delete restrict,
  primary_contact_id uuid references public.contacts(id) on delete set null,
  unit_asset text not null,
  segment text not null,
  lead_source text,
  service_type text not null,
  main_discipline text not null,
  involved_disciplines text[] not null default '{}',
  project_phase public.project_phase not null default 'nao_definido',
  scope_summary text,
  client_objective text,
  tr_received boolean not null default false,
  rfq_received boolean not null default false,
  field_visit_required boolean not null default false,
  nda_required boolean not null default false,
  base_documents jsonb not null default '[]'::jsonb,
  assumptions text,
  out_of_scope text,
  risks text,
  information_gaps text,
  hh_estimated numeric(12,2),
  estimated_value numeric(14,2) not null default 0,
  target_margin numeric(5,2),
  probability integer not null default 0 check (probability between 0 and 100),
  stage public.opportunity_stage not null default 'lead_identificado',
  next_step text,
  next_step_date date,
  current_blocker text,
  mapped_competitor text,
  go_no_go_notes text,
  owner_user_id uuid references public.profiles(id),
  technical_lead_user_id uuid references public.profiles(id),
  director_approver_user_id uuid references public.profiles(id),
  lost_reason public.loss_reason,
  lost_reason_notes text,
  closed_at timestamptz,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  version_number integer not null,
  status public.proposal_status not null default 'rascunho',
  technical_summary text,
  assumptions text,
  out_of_scope text,
  documents_list jsonb not null default '[]'::jsonb,
  price_sheet jsonb not null default '[]'::jsonb,
  proposed_value numeric(14,2) not null default 0,
  validity_days integer,
  delivery_deadline_days integer,
  sent_at timestamptz,
  approved_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, version_number)
);

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  interaction_type public.interaction_type not null,
  subject text,
  notes text,
  interaction_at timestamptz not null default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.stage_history (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  from_stage public.opportunity_stage,
  to_stage public.opportunity_stage not null,
  note text,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at before update on public.accounts
for each row execute procedure public.set_updated_at();

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at before update on public.contacts
for each row execute procedure public.set_updated_at();

drop trigger if exists set_opportunities_updated_at on public.opportunities;
create trigger set_opportunities_updated_at before update on public.opportunities
for each row execute procedure public.set_updated_at();

drop trigger if exists set_proposal_versions_updated_at on public.proposal_versions;
create trigger set_proposal_versions_updated_at before update on public.proposal_versions
for each row execute procedure public.set_updated_at();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.contacts enable row level security;
alter table public.opportunities enable row level security;
alter table public.proposal_versions enable row level security;
alter table public.interactions enable row level security;
alter table public.stage_history enable row level security;

create policy "internal users can read profiles"
on public.profiles for select
using (public.is_internal_user());

create policy "internal users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "internal users can read accounts"
on public.accounts for select
using (public.is_internal_user());

create policy "internal users can insert accounts"
on public.accounts for insert
to authenticated
with check (public.is_internal_user());

create policy "internal users can update accounts"
on public.accounts for update
using (public.is_internal_user())
with check (public.is_internal_user());

create policy "admins can delete accounts"
on public.accounts for delete
using (public.current_app_role() in ('admin', 'diretoria'));

create policy "internal users can read contacts"
on public.contacts for select
using (public.is_internal_user());

create policy "internal users can insert contacts"
on public.contacts for insert
to authenticated
with check (public.is_internal_user());

create policy "internal users can update contacts"
on public.contacts for update
using (public.is_internal_user())
with check (public.is_internal_user());

create policy "admins can delete contacts"
on public.contacts for delete
using (public.current_app_role() in ('admin', 'diretoria'));

create policy "internal users can read opportunities"
on public.opportunities for select
using (public.is_internal_user());

create policy "internal users can insert opportunities"
on public.opportunities for insert
to authenticated
with check (public.is_internal_user());

create policy "internal users can update opportunities"
on public.opportunities for update
using (public.is_internal_user())
with check (public.is_internal_user());

create policy "admins can delete opportunities"
on public.opportunities for delete
using (public.current_app_role() in ('admin', 'diretoria'));

create policy "internal users can read proposal_versions"
on public.proposal_versions for select
using (public.is_internal_user());

create policy "internal users can insert proposal_versions"
on public.proposal_versions for insert
to authenticated
with check (public.is_internal_user());

create policy "internal users can update proposal_versions"
on public.proposal_versions for update
using (public.is_internal_user())
with check (public.is_internal_user());

create policy "admins can delete proposal_versions"
on public.proposal_versions for delete
using (public.current_app_role() in ('admin', 'diretoria'));

create policy "internal users can read interactions"
on public.interactions for select
using (public.is_internal_user());

create policy "internal users can insert interactions"
on public.interactions for insert
to authenticated
with check (public.is_internal_user());

create policy "internal users can update interactions"
on public.interactions for update
using (public.is_internal_user())
with check (public.is_internal_user());

create policy "admins can delete interactions"
on public.interactions for delete
using (public.current_app_role() in ('admin', 'diretoria'));

create policy "internal users can read stage_history"
on public.stage_history for select
using (public.is_internal_user());

create policy "internal users can insert stage_history"
on public.stage_history for insert
to authenticated
with check (public.is_internal_user());

create policy "admins can delete stage_history"
on public.stage_history for delete
using (public.current_app_role() in ('admin', 'diretoria'));

insert into public.accounts (name, legal_name, segment, notes)
values
  ('PRIO', 'PRIO S.A.', 'Óleo e Gás', 'Conta exemplo para desenvolvimento'),
  ('Braskem', 'Braskem S.A.', 'Químico/Petroquímico', 'Conta exemplo para desenvolvimento')
on conflict do nothing;

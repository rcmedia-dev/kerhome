-- Confiança e dados dos anúncios (relatório Kercasa §1–5)
-- Executar no Supabase SQL Editor.

-- 1) Campos de disponibilidade / verificação em properties
alter table public.properties
  add column if not exists is_available boolean not null default true,
  add column if not exists is_verified boolean not null default false,
  add column if not exists verified_at timestamptz null,
  add column if not exists reports_count integer not null default 0;

-- 2) Garante updated_at com trigger
alter table public.properties
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_properties_updated_at on public.properties;
create trigger trg_properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

-- 3) Tabela de reportes de anúncio
create table if not exists public.property_reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reporter_id uuid null references auth.users(id) on delete set null,
  motivo text not null check (motivo in (
    'preco_incorreto','indisponivel','duplicado','fotos_falsas',
    'fraude','localizacao_incorreta','outro'
  )),
  descricao text null,
  contacto text null,
  status text not null default 'pending' check (status in (
    'pending','reviewing','resolved','dismissed'
  )),
  created_at timestamptz not null default now()
);

alter table public.property_reports enable row level security;

drop policy if exists "anyone can report" on public.property_reports;
create policy "anyone can report"
  on public.property_reports for insert to anon, authenticated with check (true);

drop policy if exists "admins manage reports" on public.property_reports;
create policy "admins manage reports"
  on public.property_reports for all to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create index if not exists idx_property_reports_property
  on public.property_reports(property_id);
create index if not exists idx_property_reports_status
  on public.property_reports(status);

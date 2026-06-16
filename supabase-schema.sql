-- TE QUERO BEM - SUPABASE
-- Execute este arquivo no SQL Editor do Supabase.
-- Depois, em Authentication > Users, crie seu usuario admin com seu e-mail.
-- Por fim, troque o e-mail abaixo em "admin_users".

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lojistas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nome_loja text not null,
  responsavel text,
  email text,
  cidade text not null,
  estado text not null,
  whatsapp text not null,
  instagram text,
  categoria text not null,
  descricao text,
  produtos text,
  faixa_preco text,
  horario text,
  entrega text,
  plano text not null default 'Basico',
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado', 'suspenso')),
  plano_status text not null default 'pendente' check (plano_status in ('pendente', 'pago', 'vencido', 'isento')),
  destaque boolean not null default false,
  logo_url text,
  capa_url text,
  foto_1_url text,
  foto_2_url text,
  observacao_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  aprovado_em timestamptz
);

alter table public.lojistas add column if not exists foto_1_url text;
alter table public.lojistas add column if not exists foto_2_url text;

create table if not exists public.produtos_lojista (
  id uuid primary key default gen_random_uuid(),
  lojista_id uuid not null references public.lojistas(id) on delete cascade,
  nome text not null,
  descricao text,
  preco text,
  imagem_url text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'recusado', 'suspenso')),
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_lojistas_updated_at on public.lojistas;
create trigger trg_lojistas_updated_at
before update on public.lojistas
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.admin_users enable row level security;
alter table public.lojistas enable row level security;
alter table public.produtos_lojista enable row level security;

drop policy if exists "Admins podem ver admins" on public.admin_users;
create policy "Admins podem ver admins"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Publico ve lojistas aprovados" on public.lojistas;
create policy "Publico ve lojistas aprovados"
on public.lojistas for select
to anon, authenticated
using (status = 'aprovado' or public.is_admin() or auth.uid() = user_id);

drop policy if exists "Qualquer pessoa cadastra lojista pendente" on public.lojistas;
create policy "Qualquer pessoa cadastra lojista pendente"
on public.lojistas for insert
to anon, authenticated
with check (status = 'pendente' and plano_status = 'pendente');

drop policy if exists "Admins atualizam lojistas" on public.lojistas;
create policy "Admins atualizam lojistas"
on public.lojistas for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Publico ve produtos aprovados" on public.produtos_lojista;
create policy "Publico ve produtos aprovados"
on public.produtos_lojista for select
to anon, authenticated
using (
  status = 'aprovado'
  or public.is_admin()
  or exists (
    select 1 from public.lojistas l
    where l.id = produtos_lojista.lojista_id
    and l.user_id = auth.uid()
  )
);

drop policy if exists "Qualquer pessoa cadastra produto pendente" on public.produtos_lojista;
create policy "Qualquer pessoa cadastra produto pendente"
on public.produtos_lojista for insert
to anon, authenticated
with check (status = 'pendente');

drop policy if exists "Admins atualizam produtos" on public.produtos_lojista;
create policy "Admins atualizam produtos"
on public.produtos_lojista for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('loja-imagens', 'loja-imagens', true)
on conflict (id) do update set public = true;

drop policy if exists "Publico envia imagens de lojas" on storage.objects;
create policy "Publico envia imagens de lojas"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'loja-imagens');

drop policy if exists "Publico le imagens de lojas" on storage.objects;
create policy "Publico le imagens de lojas"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'loja-imagens');

drop policy if exists "Admins removem imagens de lojas" on storage.objects;
create policy "Admins removem imagens de lojas"
on storage.objects for delete
to authenticated
using (bucket_id = 'loja-imagens' and public.is_admin());

-- Troque este e-mail pelo e-mail que voce usara para entrar no painel admin.
insert into public.admin_users (email)
values ('SEU_EMAIL_ADMIN_AQUI')
on conflict (email) do nothing;

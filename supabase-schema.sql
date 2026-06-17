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

delete from public.admin_users
where email = 'SEU_EMAIL_ADMIN_AQUI';

-- E-mail que voce usara para entrar no painel admin.
insert into public.admin_users (email)
values ('cincoregioes@gmail.com')
on conflict (email) do nothing;

update public.lojistas
set
  responsavel = 'Carlos',
  email = 'cincoregioes@gmail.com',
  cidade = 'Brasil',
  estado = 'BR',
  whatsapp = '85997120397',
  categoria = 'Presentes digitais e educacao',
  descricao = 'O DB ENEM oferece presentes digitais educativos para estudantes, com questoes, simulados, mensagens de incentivo e materiais de preparacao para o ENEM.',
  produtos = 'Kit de questoes ENEM, simulado personalizado, plano de estudos, cartao digital de incentivo e mensagem personalizada para estudante.',
  faixa_preco = 'A combinar',
  horario = 'Atendimento online',
  entrega = 'Entrega digital pelo WhatsApp ou link',
  plano = 'Regional fundador',
  status = 'aprovado',
  plano_status = 'isento',
  destaque = true,
  capa_url = 'assets/db-enem-digital.png',
  foto_1_url = 'assets/gabarito-max-digital.png',
  foto_2_url = 'assets/presente-digital-educacao.png'
where lower(nome_loja) = 'db enem';

insert into public.lojistas (
  nome_loja, responsavel, email, cidade, estado, whatsapp, instagram, categoria,
  descricao, produtos, faixa_preco, horario, entrega, plano, status, plano_status,
  destaque, capa_url, foto_1_url, foto_2_url
)
select
  'DB ENEM',
  'Carlos',
  'cincoregioes@gmail.com',
  'Brasil',
  'BR',
  '85997120397',
  '',
  'Presentes digitais e educacao',
  'O DB ENEM oferece presentes digitais educativos para estudantes, com questoes, simulados, mensagens de incentivo e materiais de preparacao para o ENEM.',
  'Kit de questoes ENEM, simulado personalizado, plano de estudos, cartao digital de incentivo e mensagem personalizada para estudante.',
  'A combinar',
  'Atendimento online',
  'Entrega digital pelo WhatsApp ou link',
  'Regional fundador',
  'aprovado',
  'isento',
  true,
  'assets/db-enem-digital.png',
  'assets/gabarito-max-digital.png',
  'assets/presente-digital-educacao.png'
where not exists (
  select 1 from public.lojistas where lower(nome_loja) = 'db enem'
);

update public.lojistas
set
  responsavel = 'Carlos',
  email = 'cincoregioes@gmail.com',
  cidade = 'Brasil',
  estado = 'BR',
  whatsapp = '85997120397',
  categoria = 'Presentes digitais e educacao',
  descricao = 'O Gabarito Max oferece presentes digitais de estudo, com simulados, acompanhamento, mensagens de incentivo e materiais para melhorar o desempenho escolar.',
  produtos = 'Simulado personalizado, kit de revisao, roteiro de estudos, cartao digital de incentivo e presente educativo para estudante.',
  faixa_preco = 'A combinar',
  horario = 'Atendimento online',
  entrega = 'Entrega digital pelo WhatsApp ou link',
  plano = 'Destaque fundador',
  status = 'aprovado',
  plano_status = 'isento',
  destaque = true,
  capa_url = 'assets/gabarito-max-digital.png',
  foto_1_url = 'assets/db-enem-digital.png',
  foto_2_url = 'assets/presente-digital-educacao.png'
where lower(nome_loja) = 'gabarito max';

insert into public.lojistas (
  nome_loja, responsavel, email, cidade, estado, whatsapp, instagram, categoria,
  descricao, produtos, faixa_preco, horario, entrega, plano, status, plano_status,
  destaque, capa_url, foto_1_url, foto_2_url
)
select
  'Gabarito Max',
  'Carlos',
  'cincoregioes@gmail.com',
  'Brasil',
  'BR',
  '85997120397',
  '',
  'Presentes digitais e educacao',
  'O Gabarito Max oferece presentes digitais de estudo, com simulados, acompanhamento, mensagens de incentivo e materiais para melhorar o desempenho escolar.',
  'Simulado personalizado, kit de revisao, roteiro de estudos, cartao digital de incentivo e presente educativo para estudante.',
  'A combinar',
  'Atendimento online',
  'Entrega digital pelo WhatsApp ou link',
  'Destaque fundador',
  'aprovado',
  'isento',
  true,
  'assets/gabarito-max-digital.png',
  'assets/db-enem-digital.png',
  'assets/presente-digital-educacao.png'
where not exists (
  select 1 from public.lojistas where lower(nome_loja) = 'gabarito max'
);

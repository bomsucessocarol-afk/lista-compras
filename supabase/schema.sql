-- =========================================================
-- Lista de Compras — banco do app (projeto Supabase SÓ do app)
-- Cole tudo no Supabase > SQL Editor > New query > Run
-- =========================================================

-- 1) Dados de cada pessoa (listas, receitas, cardápio, perfil...)
create table if not exists public.app_dados (
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  chave      text not null,
  dados      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, chave)
);
alter table public.app_dados enable row level security;

drop policy if exists "ver os meus dados"     on public.app_dados;
drop policy if exists "criar os meus dados"   on public.app_dados;
drop policy if exists "mudar os meus dados"   on public.app_dados;
drop policy if exists "apagar os meus dados"  on public.app_dados;
create policy "ver os meus dados"    on public.app_dados for select to authenticated using ((select auth.uid()) = user_id);
create policy "criar os meus dados"  on public.app_dados for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "mudar os meus dados"  on public.app_dados for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "apagar os meus dados" on public.app_dados for delete to authenticated using ((select auth.uid()) = user_id);

-- 2) Acessos liberados à mão (você, clientes de iPhone/navegador, cortesias)
--    Quem compra pela Google Play é liberado direto pela Google; não precisa estar aqui.
create table if not exists public.acessos (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  planos      text[] not null default '{}',   -- 'economia', 'cardapio', 'completo'
  acesso_web  boolean not null default false, -- pode usar pelo navegador/iPhone
  ate         timestamptz,                    -- vazio = para sempre
  obs         text,
  created_at  timestamptz not null default now()
);
alter table public.acessos enable row level security;
drop policy if exists "ver o meu acesso" on public.acessos;
create policy "ver o meu acesso" on public.acessos for select to authenticated using ((select auth.uid()) = user_id);
-- (sem regra de criar/mudar: só você, pelo painel do Supabase, libera acessos)

-- 3) Excluir minha conta (exigência da Google Play)
create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;

-- =========================================================
-- DEPOIS de criar a SUA conta no app, rode isto (troque o e-mail)
-- para você ter tudo liberado, inclusive no iPhone:
--
-- insert into public.acessos (user_id, planos, acesso_web, obs)
-- select id, '{completo}', true, 'dona do app'
-- from auth.users where email = 'SEU-EMAIL@AQUI.com'
-- on conflict (user_id) do update set planos = excluded.planos, acesso_web = true;
-- =========================================================

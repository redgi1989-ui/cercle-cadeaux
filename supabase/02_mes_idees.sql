-- =====================================================================
--  Cercle Cadeaux — ajout « Mes idées » (réserve d'idées personnelle)
--  À lancer APRÈS schema.sql : SQL Editor > New query > coller > Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Les proches sans compte que je gère (enfants, grands-parents…)
--    Ils existent une seule fois, et peuvent avoir une liste dans plusieurs cercles.
-- ---------------------------------------------------------------------
create table public.people (
  id          uuid primary key default gen_random_uuid(),
  managed_by  uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  person_type text not null default 'enfant' check (person_type in ('enfant','adulte','autre')),
  info        text not null default '',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. La réserve d'idées : privée, visible seulement par son auteur.
--    person_id vide = mes idées pour moi ; sinon = idées pour un proche que je gère.
-- ---------------------------------------------------------------------
create table public.ideas (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  person_id     uuid references public.people(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  url           text,
  image_url     text,
  site          text,
  price         text,
  note          text not null default '',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Liens avec les listes et cadeaux existants
-- ---------------------------------------------------------------------
-- Une liste gérée peut pointer vers un proche (pour retrouver ses idées)
alter table public.lists add column person_id uuid references public.people(id) on delete set null;
create unique index lists_one_per_person_per_circle
  on public.lists (circle_id, person_id) where person_id is not null;

-- Un cadeau ajouté depuis la réserve garde le lien vers l'idée d'origine
-- (pour afficher « déjà dans la liste » et éviter de l'ajouter deux fois)
alter table public.gifts add column idea_id uuid references public.ideas(id) on delete set null;
create unique index gifts_one_per_idea_per_list
  on public.gifts (list_id, idea_id) where idea_id is not null;

-- ---------------------------------------------------------------------
-- 4. Sécurité
-- ---------------------------------------------------------------------
create or replace function public.manages_person(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from people where id = p and managed_by = auth.uid());
$$;

alter table public.people enable row level security;
alter table public.ideas  enable row level security;

create policy "mes proches" on public.people
  for all using (managed_by = auth.uid()) with check (managed_by = auth.uid());

create policy "mes idées" on public.ideas
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid() and (person_id is null or public.manages_person(person_id)));

-- Créer une liste gérée : si elle pointe vers un proche, il doit être le mien
drop policy "créer une liste gérée" on public.lists;
create policy "créer une liste gérée" on public.lists
  for insert with check (
    public.is_member(circle_id)
    and owner_user_id is null
    and managed_by = auth.uid()
    and (person_id is null or public.manages_person(person_id))
  );

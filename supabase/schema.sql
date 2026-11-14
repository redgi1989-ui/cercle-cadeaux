-- =====================================================================
--  Cercle Cadeaux — schéma de la base de données Supabase
--  À coller en une fois dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- Profil de chaque personne inscrite (créé automatiquement à l'inscription)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now()
);

-- Un cercle = un groupe (famille, amis…) pour une occasion
create table public.circles (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null check (char_length(name) between 1 and 80),
  occasion             text not null check (occasion in ('noel','stnicolas','anniv','paques','halloween','fetes','autre')),
  event_date           date,
  join_code            text not null unique check (join_code ~ '^[A-Z0-9]{4,12}$'),
  owners_see_purchases boolean not null default true,
  created_by           uuid not null references public.profiles(id) on delete cascade,
  created_at           timestamptz not null default now()
);

-- Qui fait partie de quel cercle
create table public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text not null default 'member' check (role in ('admin','member')),
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

-- Listes de souhaits :
--  - la liste d'un membre (owner_user_id renseigné)
--  - ou une liste gérée pour quelqu'un sans compte : enfant, grand-parent… (managed_by renseigné)
create table public.lists (
  id            uuid primary key default gen_random_uuid(),
  circle_id     uuid not null references public.circles(id) on delete cascade,
  owner_user_id uuid references public.profiles(id) on delete cascade,
  managed_by    uuid references public.profiles(id) on delete cascade,
  person_name   text not null default '',
  person_type   text not null default 'moi' check (person_type in ('moi','enfant','adulte','autre')),
  info          text not null default '',
  created_at    timestamptz not null default now(),
  check (owner_user_id is not null or managed_by is not null)
);
create unique index lists_one_own_per_circle
  on public.lists (circle_id, owner_user_id) where owner_user_id is not null;

-- Cadeaux d'une liste
create table public.gifts (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.lists(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 200),
  url        text,
  image_url  text,
  site       text,
  price      text,
  note       text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Achats : un seul achat possible par cadeau (évite les doublons)
create table public.purchases (
  gift_id   uuid primary key references public.gifts(id) on delete cascade,
  bought_by uuid not null references public.profiles(id) on delete cascade,
  bought_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Fonctions utilitaires pour les règles de sécurité
-- ---------------------------------------------------------------------

create or replace function public.is_member(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from circle_members where circle_id = c and user_id = auth.uid());
$$;

create or replace function public.is_admin(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from circle_members where circle_id = c and user_id = auth.uid() and role = 'admin');
$$;

create or replace function public.shares_circle(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from circle_members a
    join circle_members b on b.circle_id = a.circle_id
    where a.user_id = auth.uid() and b.user_id = p
  );
$$;

create or replace function public.list_circle(l uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select circle_id from lists where id = l;
$$;

create or replace function public.can_edit_list(l uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from lists
    where id = l and (owner_user_id = auth.uid() or managed_by = auth.uid())
  );
$$;

-- Voir l'achat d'un cadeau : membre du cercle, et si c'est sa propre liste,
-- seulement quand le cercle l'autorise (réglage "chacun voit les achats")
create or replace function public.can_see_purchase(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from gifts gi
    join lists li   on li.id = gi.list_id
    join circles ci on ci.id = li.circle_id
    where gi.id = g
      and public.is_member(ci.id)
      and (li.owner_user_id is distinct from auth.uid() or ci.owners_see_purchases)
  );
$$;

-- Marquer un cadeau comme acheté : membre du cercle, et pas sur sa propre liste
create or replace function public.can_buy(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from gifts gi
    join lists li on li.id = gi.list_id
    where gi.id = g
      and public.is_member(li.circle_id)
      and li.owner_user_id is distinct from auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- 3. Règles de sécurité (Row Level Security)
-- ---------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.circles        enable row level security;
alter table public.circle_members enable row level security;
alter table public.lists          enable row level security;
alter table public.gifts          enable row level security;
alter table public.purchases      enable row level security;

-- Profils : on voit le sien et ceux des personnes de ses cercles
create policy "profils visibles" on public.profiles
  for select using (id = auth.uid() or public.shares_circle(id));
create policy "modifier son profil" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Cercles : visibles par les membres, modifiables par les administrateurs
-- (la création passe par la fonction create_circle plus bas)
create policy "cercles visibles par les membres" on public.circles
  for select using (public.is_member(id));
create policy "admin modifie le cercle" on public.circles
  for update using (public.is_admin(id)) with check (public.is_admin(id));
create policy "admin supprime le cercle" on public.circles
  for delete using (public.is_admin(id));

-- Membres : visibles entre membres ; on peut quitter, l'admin peut retirer
-- (l'ajout passe par les fonctions create_circle / join_circle)
create policy "membres visibles" on public.circle_members
  for select using (public.is_member(circle_id));
create policy "quitter ou retirer" on public.circle_members
  for delete using (user_id = auth.uid() or public.is_admin(circle_id));
create policy "admin change les rôles" on public.circle_members
  for update using (public.is_admin(circle_id)) with check (public.is_admin(circle_id));

-- Listes
create policy "listes visibles par les membres" on public.lists
  for select using (public.is_member(circle_id));
create policy "créer une liste gérée" on public.lists
  for insert with check (
    public.is_member(circle_id) and owner_user_id is null and managed_by = auth.uid()
  );
create policy "modifier sa liste" on public.lists
  for update using (owner_user_id = auth.uid() or managed_by = auth.uid() or public.is_admin(circle_id))
  with check (owner_user_id = auth.uid() or managed_by = auth.uid() or public.is_admin(circle_id));
create policy "supprimer une liste gérée" on public.lists
  for delete using (managed_by = auth.uid() or public.is_admin(circle_id));

-- Cadeaux : visibles par le cercle, modifiables par le propriétaire ou le gestionnaire de la liste
create policy "cadeaux visibles" on public.gifts
  for select using (public.is_member(public.list_circle(list_id)));
create policy "ajouter un cadeau" on public.gifts
  for insert with check (public.can_edit_list(list_id) and created_by = auth.uid());
create policy "modifier un cadeau" on public.gifts
  for update using (public.can_edit_list(list_id)) with check (public.can_edit_list(list_id));
create policy "supprimer un cadeau" on public.gifts
  for delete using (public.can_edit_list(list_id));

-- Achats
create policy "achats visibles" on public.purchases
  for select using (public.can_see_purchase(gift_id));
create policy "marquer acheté" on public.purchases
  for insert with check (bought_by = auth.uid() and public.can_buy(gift_id));
create policy "annuler son achat" on public.purchases
  for delete using (bought_by = auth.uid());

-- ---------------------------------------------------------------------
-- 4. Actions : créer un cercle, rejoindre avec un code
-- ---------------------------------------------------------------------

create or replace function public.create_circle(
  p_name text, p_occasion text, p_event_date date, p_code text, p_owners_see boolean
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  cid  uuid;
  code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if auth.uid() is null then raise exception 'NON_CONNECTE'; end if;
  if code !~ '^[A-Z0-9]{4,12}$' then raise exception 'CODE_INVALIDE'; end if;
  if exists (select 1 from circles where join_code = code) then raise exception 'CODE_PRIS'; end if;

  insert into circles (name, occasion, event_date, join_code, owners_see_purchases, created_by)
  values (trim(p_name), p_occasion, p_event_date, code, coalesce(p_owners_see, true), auth.uid())
  returning id into cid;

  insert into circle_members (circle_id, user_id, role) values (cid, auth.uid(), 'admin');
  insert into lists (circle_id, owner_user_id, person_type) values (cid, auth.uid(), 'moi');
  return cid;
end $$;

create or replace function public.join_circle(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  cid  uuid;
  code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if auth.uid() is null then raise exception 'NON_CONNECTE'; end if;
  select id into cid from circles where join_code = code;
  if cid is null then raise exception 'CODE_INCONNU'; end if;

  insert into circle_members (circle_id, user_id) values (cid, auth.uid())
  on conflict do nothing;
  insert into lists (circle_id, owner_user_id, person_type) values (cid, auth.uid(), 'moi')
  on conflict (circle_id, owner_user_id) where owner_user_id is not null do nothing;
  return cid;
end $$;

revoke execute on function public.create_circle(text, text, date, text, boolean) from public, anon;
revoke execute on function public.join_circle(text) from public, anon;
grant  execute on function public.create_circle(text, text, date, text, boolean) to authenticated;
grant  execute on function public.join_circle(text) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Création automatique du profil à l'inscription
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 6. Mises à jour en direct (quand quelqu'un coche "acheté", les autres le voient)
-- ---------------------------------------------------------------------

alter publication supabase_realtime add table public.gifts, public.purchases, public.lists;

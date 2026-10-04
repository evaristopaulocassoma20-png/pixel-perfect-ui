create type public.app_role as enum ('admin','user');

create table public.profiles (
  id uuid primary key,
  username text not null,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles own insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "roles own read" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "roles admin manage" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  type text not null default 'Anime',
  artist_slug text not null,
  artist_name text not null,
  tags text[] not null default '{}',
  year int not null default 2026,
  cover text not null default '',
  synopsis text not null default '',
  views int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.works to anon;
grant select, insert, update, delete on public.works to authenticated;
grant all on public.works to service_role;
alter table public.works enable row level security;
create policy "works public read" on public.works for select using (true);
create policy "works admin write" on public.works for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  number int not null,
  title text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.episodes to anon;
grant select, insert, update, delete on public.episodes to authenticated;
grant all on public.episodes to service_role;
alter table public.episodes enable row level security;
create policy "episodes public read" on public.episodes for select using (true);
create policy "episodes admin write" on public.episodes for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
grant select on public.comments to anon;
grant select, insert, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments public read" on public.comments for select using (true);
create policy "comments own insert" on public.comments for insert to authenticated with check (auth.uid() = user_id and length(body) between 1 and 1000);
create policy "comments own or admin delete" on public.comments for delete to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));

create or replace function public.increment_views(_slug text)
returns void language sql security definer set search_path = public
as $$ update public.works set views = views + 1 where slug = _slug $$;
grant execute on function public.increment_views(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.works (slug,title,type,artist_slug,artist_name,tags,year,cover,synopsis,views,created_at) values
('lamina-do-crepusculo','Lâmina do Crepúsculo','Mangá','aki-moriyama','Aki Moriyama','{acao,fantasia}',2025,'cover-1','Uma espadachim solitária patrulha os telhados de Neo-Kyoto para proteger quem não pode lutar.',1520, now() - interval '3 days'),
('padaria-da-raposa','A Padaria da Raposa','Mangá','yuna-hoshi','Yuna Hoshi','{slice-of-life,fantasia,comedia}',2024,'cover-2','Uma jovem padeira divide o forno com um espírito-raposa que adora pão doce.',870, now() - interval '10 days'),
('titas-do-oceano','Titãs do Oceano','Anime','studio-kaze','Studio Kaze','{mecha,ficcao-cientifica,acao}',2026,'cover-3','Num mundo engolido pelo mar, um rapaz pilota o último gigante de aço.',2310, now() - interval '1 day'),
('chuva-em-shibuya','Chuva em Shibuya','Mangá','aki-moriyama','Aki Moriyama','{misterio,romance}',2023,'cover-4','Dois estudantes resolvem casos que a polícia esqueceu, sempre em noites de chuva.',640, now() - interval '20 days');

insert into public.episodes (work_id, number, title, created_at)
select id, n, 'Episódio ' || n, now() - ((5 - n) || ' hours')::interval from public.works, generate_series(1,3) n;
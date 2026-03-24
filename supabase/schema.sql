-- AgentID Schema
-- Run this in Supabase SQL Editor

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  name text not null check (char_length(name) between 1 and 100),
  provider text check (char_length(provider) <= 100),
  description text check (char_length(description) <= 500),
  avatar_url text,
  protocols text[] not null default '{}',
  mcp_endpoint text,
  a2a_endpoint text,
  api_endpoint text,
  capabilities text[] not null default '{}',
  tags text[] not null default '{}',
  pricing text check (pricing in ('free', 'freemium', 'paid', 'enterprise')),
  website text,
  github text,
  raw_a2a_json jsonb,
  edit_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for slug lookups (primary access pattern)
create index if not exists idx_agents_slug on agents (slug);

-- Index for browsing/discovery
create index if not exists idx_agents_protocols on agents using gin (protocols);
create index if not exists idx_agents_tags on agents using gin (tags);
create index if not exists idx_agents_created on agents (created_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agents_updated_at
  before update on agents
  for each row execute function update_updated_at();

-- RLS: public read, authenticated write via API routes (using service role)
alter table agents enable row level security;

create policy "Public read access" on agents
  for select using (true);

-- No direct insert/update/delete from client — all writes go through API routes
-- which use the service role key server-side

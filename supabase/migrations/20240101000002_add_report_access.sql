-- Create report_access table
create table if not exists public.report_access (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  analysis_id uuid not null references public.idea_analyses(id) on delete cascade,
  access_token uuid not null unique,
  expires_at timestamp with time zone not null,
  
  -- Add indexes for common queries
  constraint report_access_email_analysis_id_key unique (email, analysis_id)
);

-- Set up RLS policies
alter table public.report_access enable row level security;

-- Allow anyone to insert (for email collection)
create policy "Enable insert access for all users" on public.report_access
  for insert with check (true);

-- Allow reading only with valid access token
create policy "Enable read access with valid token" on public.report_access
  for select using (
    access_token = current_setting('request.jwt.claim.access_token', true)::uuid
    and expires_at > now()
  );

-- Add types to existing idea_analyses table
alter table public.idea_analyses
  add column if not exists report_generated boolean default false,
  add column if not exists report_data jsonb;

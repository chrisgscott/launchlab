-- Drop existing tables if they exist
drop table if exists report_access_urls cascade;
drop table if exists idea_reports cascade;
drop table if exists idea_analyses cascade;

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Create idea_insights table
create table idea_insights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  
  -- Idea identification
  idea_name text not null,
  
  -- Input data
  problem_statement text not null,
  target_audience text not null,
  unique_value_proposition text not null,
  product_description text not null,
  
  -- Analysis results
  total_score integer not null,
  validation_status text not null,
  
  -- Category scores and insights
  market_opportunity jsonb not null,
  competitive_advantage jsonb not null,
  feasibility jsonb not null,
  revenue_potential jsonb not null,
  market_timing jsonb not null,
  scalability jsonb not null,
  
  -- Action items
  critical_issues jsonb[],
  next_steps jsonb[],
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Ensure unique idea names per user
  constraint idea_insights_user_id_idea_name_key unique(user_id, idea_name)
);

-- Create idea_reports table
create table idea_reports (
  id uuid primary key default uuid_generate_v4(),
  insight_id uuid references idea_insights(id) not null,
  user_id uuid references auth.users(id),
  url text not null unique,
  
  -- Report sections
  summary text not null,
  key_strengths jsonb not null,
  monetization jsonb not null,
  refinement_questions jsonb[] not null,
  challenges jsonb[] not null,
  mitigation_strategies jsonb[] not null,
  recommendation jsonb[] not null,
  next_steps jsonb[],              -- Optional based on validation status
  improvement_areas jsonb[],       -- Optional based on validation status
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index idea_insights_user_id_idx on idea_insights(user_id);
create index idea_insights_created_at_idx on idea_insights(created_at);
create index idea_reports_user_id_idx on idea_reports(user_id);
create index idea_reports_insight_id_idx on idea_reports(insight_id);
create index idea_reports_created_at_idx on idea_reports(created_at);

-- Enable RLS
alter table idea_insights enable row level security;
alter table idea_reports enable row level security;

-- RLS policies for idea_insights
drop policy if exists "Allow access to insights via URL or user_id" on idea_insights;

-- Allow anonymous access to insights
create policy "Allow anonymous access to insights"
  on idea_insights for all
  using (true)
  with check (true);

-- RLS policies for idea_reports
create policy "Allow access to reports via URL or user_id"
  on idea_reports for all
  using (
    -- Authenticated users can access their own reports
    (auth.uid() = user_id)
    -- Anyone can access via URL
    OR url = current_setting('request.url.path')
  );

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_idea_insights_updated_at
    before update on idea_insights
    for each row
    execute procedure update_updated_at_column();

create trigger update_idea_reports_updated_at
    before update on idea_reports
    for each row
    execute procedure update_updated_at_column();

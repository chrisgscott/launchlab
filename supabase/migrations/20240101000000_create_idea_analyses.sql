-- Create idea_analyses table
create table if not exists idea_analyses (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Input data
    problem_statement text not null,
    target_audience text not null,
    unique_value_proposition text not null,
    product_description text not null,
    
    -- Analysis results
    insights jsonb not null,
    
    -- User association (for when we add auth)
    user_id uuid references auth.users(id)
);

-- Create updated_at trigger
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger handle_idea_analyses_updated_at
    before update on idea_analyses
    for each row
    execute function handle_updated_at();

-- Enable RLS
alter table idea_analyses enable row level security;

-- Create policies
create policy "Analyses are viewable by everyone"
    on idea_analyses for select
    using (true);

create policy "Users can insert their own analyses"
    on idea_analyses for insert
    with check (
        auth.uid() = user_id
        -- Allow anonymous submissions for now
        or user_id is null
    );

-- Create indexes
create index idx_idea_analyses_user_id on idea_analyses(user_id);
create index idx_idea_analyses_created_at on idea_analyses(created_at desc);
create index idx_idea_analyses_insights on idea_analyses using gin (insights);

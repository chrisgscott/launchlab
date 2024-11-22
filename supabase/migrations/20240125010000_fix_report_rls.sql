-- Drop the old policy that was using request.url.path
drop policy if exists "Allow access to reports via URL or user_id" on idea_reports;

-- Create a simpler policy that allows public read access to all reports
create policy "Allow public read access to reports"
  on idea_reports
  for select
  using (true);

-- Only allow authenticated users to create/update/delete their own reports
create policy "Allow authenticated users to manage their reports"
  on idea_reports
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

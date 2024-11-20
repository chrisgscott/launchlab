-- Create function to generate report access tokens
create or replace function public.create_report_access_token(
  p_analysis_id uuid,
  p_email text
) returns uuid as $$
declare
  v_access_token uuid;
  v_expires_at timestamp with time zone;
begin
  -- Generate a random UUID for the access token
  v_access_token := gen_random_uuid();
  
  -- Set expiration to 7 days from now
  v_expires_at := timezone('utc'::text, now()) + interval '7 days';

  -- Insert or update the access token
  insert into public.report_access (
    analysis_id,
    email,
    access_token,
    expires_at
  ) values (
    p_analysis_id,
    p_email,
    v_access_token,
    v_expires_at
  )
  on conflict (email, analysis_id) do update set
    access_token = excluded.access_token,
    expires_at = excluded.expires_at;

  -- Return the access token
  return v_access_token;
end;
$$ language plpgsql security definer;

-- Drop existing policies
drop policy if exists "Enable read access for users' own policies" on public.policies;
drop policy if exists "Enable insert for authenticated users" on public.policies;

-- Update policies table to make all fields except title and document_url optional
alter table public.policies 
alter column type drop not null,
alter column provider drop not null,
alter column policy_number drop not null,
alter column coverage_amount drop not null,
alter column deductible drop not null,
alter column premium drop not null,
alter column start_date drop not null,
alter column end_date drop not null,
alter column notes drop not null;

-- Create read policy for users to see their own policies
create policy "Enable read access for users' own policies"
on public.policies
as permissive
for select
to authenticated
using (auth.uid() = user_id);

-- Create insert policy for authenticated users
create policy "Enable insert for authenticated users"
on public.policies
as permissive
for insert
to authenticated
with check (true);

-- Create update policy for users to update their own policies
create policy "Enable update for users' own policies"
on public.policies
as permissive
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create delete policy for users to delete their own policies
create policy "Enable delete for users' own policies"
on public.policies
as permissive
for delete
to authenticated
using (auth.uid() = user_id);

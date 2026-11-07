-- Run once in Supabase → SQL Editor (project uzgalpnszgiwewvhineu).

-- 1) Facility photos: public read. Uploads need the service role key (npm run photos).
insert into storage.buckets (id, name, public) values ('facility-images', 'facility-images', true)
on conflict (id) do nothing;

-- 2) Signed permission letters (PDF, max 5 MB): private bucket.
--    Browsers may only ADD files; nobody can list, read, change or delete them with the public key.
--    Staff read them in the Supabase dashboard (Storage → letters).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('letters', 'letters', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "letters: anyone can add" on storage.objects;
create policy "letters: anyone can add" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'letters');

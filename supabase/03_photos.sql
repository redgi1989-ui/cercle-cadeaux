-- =====================================================================
--  Cercle Cadeaux — photos des cadeaux (quand l'aperçu automatique échoue)
--  À lancer APRÈS les deux autres scripts : SQL Editor > New query > Run
-- =====================================================================

-- Dossier de stockage public pour les photos (lisibles via leur adresse)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gift-images', 'gift-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Chacun peut ajouter des photos dans son propre dossier
create policy "photos : ajouter les siennes" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gift-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Chacun peut supprimer ses propres photos
create policy "photos : supprimer les siennes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gift-images' and owner = auth.uid());

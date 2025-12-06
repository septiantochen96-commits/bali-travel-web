-- Storage policies for 'tours' bucket
CREATE POLICY "Public read tours bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'tours');

CREATE POLICY "Authenticated upload tours bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'tours');

CREATE POLICY "Authenticated update tours bucket" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'tours')
  WITH CHECK (bucket_id = 'tours');

CREATE POLICY "Authenticated delete tours bucket" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'tours');

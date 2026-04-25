-- Harden the public-media bucket with an explicit MIME allowlist.
--
-- The bucket itself was created in 20260425010000_create_news_and_jobs.sql
-- without `allowed_mime_types` set, which means storage.objects accepted
-- any MIME at the bucket layer (Server Action validation was the only
-- gate). Now that the client compresses every photo to image/webp before
-- upload, we put webp on the allowlist explicitly while keeping the
-- previously supported types around for callers that haven't switched
-- to the compressed pipeline yet.
--
-- This change does NOT loosen any policy — it tightens the bucket from
-- "any MIME" to a known set. RLS, audit_log, and Server Action
-- validation are untouched.

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]
where id = 'public-media';

/**
 * Build a public URL for an object in the `public-media` Supabase
 * Storage bucket. Works on both server and client because the project
 * URL is exposed via `NEXT_PUBLIC_SUPABASE_URL`.
 */
const PUBLIC_MEDIA_BUCKET = "public-media";

export function publicMediaUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    // Fall back to a relative path so SSR doesn't crash in environments
    // where the URL is missing — broken images surface clearly in QA.
    return `/${PUBLIC_MEDIA_BUCKET}/${path}`;
  }
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${PUBLIC_MEDIA_BUCKET}/${path}`;
}

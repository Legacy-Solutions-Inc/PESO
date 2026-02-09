export function getSafeRedirectUrl(next: string, origin: string): string {
  try {
    // Construct URL relative to origin.
    // If next is absolute, it will use that absolute URL.
    // If next is relative, it will use origin as base.
    const url = new URL(next, origin);

    // Verify that the origin matches the request origin to prevent open redirects.
    if (url.origin === origin) {
      return url.toString();
    }
  } catch {
    // If URL construction fails, fall through to default.
  }

  return `${origin}/login`;
}

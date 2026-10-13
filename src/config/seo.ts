export type SeoEnvironment = 'production' | 'preview' | 'development';
type Environment = Record<string, string | undefined>;

// NODE_ENV=production also describes a local `next build`. Require an explicit
// deployment mode there instead of guessing whether that build is public.
export function getSeoConfig(env: Environment = process.env) {
  const declared = env.SEO_ENV;
  if (declared && !['production', 'preview', 'development'].includes(declared)) {
    throw new Error('SEO_ENV must be production, preview or development.');
  }

  let mode: SeoEnvironment;
  if (env.VERCEL_ENV === 'production') {
    if (declared && declared !== 'production') {
      throw new Error('A production deployment cannot use a non-production SEO_ENV.');
    }
    mode = 'production';
  } else if (env.VERCEL_ENV === 'preview' || env.VERCEL_ENV === 'development') {
    // Preview environments may inherit production variables. Always block them.
    mode = env.VERCEL_ENV;
  } else if (declared) {
    mode = declared as SeoEnvironment;
  } else if (env.NODE_ENV === 'production') {
    throw new Error('Set SEO_ENV=production for deployment, or SEO_ENV=preview for a private/local build.');
  } else {
    mode = 'development';
  }

  const value = env.NEXT_PUBLIC_SITE_URL?.trim();
  let origin: string | null = null;
  if (value) {
    let url: URL;
    try { url = new URL(value); } catch {
      throw new Error('NEXT_PUBLIC_SITE_URL must be a public HTTPS origin.');
    }
    const host = url.hostname.toLowerCase();
    const privateHost = !host.includes('.') || /^[\d.]+$/.test(host) || host.includes(':') ||
      /(^|\.)(localhost|local|internal|invalid|test)$/.test(host);
    const previewHost = /(^|\.)(vercel\.app|netlify\.app|pages\.dev|ngrok\.io|ngrok-free\.app)$/.test(host);
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      url.pathname !== '/' || url.search || url.hash || privateHost || previewHost) {
      throw new Error('NEXT_PUBLIC_SITE_URL must be a public HTTPS origin without a path, credentials, port, query or fragment; local and preview hosts are not canonical origins.');
    }
    origin = url.origin;
  }
  if (mode === 'production' && !origin) {
    throw new Error('Production SEO requires NEXT_PUBLIC_SITE_URL set to the confirmed HTTPS production origin.');
  }

  return { mode, origin, indexable: mode === 'production' && env.NODE_ENV === 'production' };
}

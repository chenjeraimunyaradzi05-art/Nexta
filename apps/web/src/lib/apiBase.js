// Central API base for the web app.
// Uses NEXT_PUBLIC_API_URL when provided, otherwise:
// - In browser: Use /api which proxies to the backend via Next.js rewrites
// - In server-side: Use the full URL for direct backend access

const isBrowser = typeof window !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';
const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');
const localApiOrigin = 'http://localhost:3333';
const envApiUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || process.env.API_INTERNAL_URL || '',
);
const appOrigin = trimTrailingSlash(
  process.env.DEPLOY_PRIME_URL ||
    process.env.URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''),
);

// In the browser, use direct API URL if set (for local testing), otherwise use /api proxy
// On the server (SSR), use the full backend URL for direct access.
export const BACKEND_API_ORIGIN = envApiUrl || (isProduction ? '' : localApiOrigin);
export const API_BASE =
  isBrowser && envApiUrl
    ? envApiUrl // Use direct URL in browser if set (testing)
    : isBrowser
      ? '/api'
      : BACKEND_API_ORIGIN || (appOrigin ? `${appOrigin}/api` : localApiOrigin);
export const SOCKET_BASE =
  trimTrailingSlash(process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || '') ||
  (isBrowser ? trimTrailingSlash(window.location.origin) : '') ||
  (isProduction ? appOrigin : localApiOrigin) ||
  localApiOrigin;

export function withApiBase(path = '') {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

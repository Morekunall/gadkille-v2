export const PRODUCTION_API_ORIGIN = 'https://api.gadkille.co.in';
const PRODUCTION_API = `${PRODUCTION_API_ORIGIN}/api`;

/** Same host that issues Google OAuth tokens (must match GOOGLE_REDIRECT_URI backend). */
export function getOAuthApiOrigin() {
  const envOAuth = String(import.meta.env.VITE_OAUTH_API_ORIGIN || '').trim();
  if (envOAuth) return envOAuth.replace(/\/$/, '');
  const base = getApiBaseUrl();
  if (/^https?:\/\//i.test(base)) return base.replace(/\/api\/?$/i, '');
  return PRODUCTION_API_ORIGIN;
}

/**
 * API base URL (VITE_API_URL overrides everything).
 * - Dev default `/api` — Vite proxies to your PC backend; works on phone over Wi‑Fi too.
 * - Prod default Render API — or use `/api` on Vercel with vercel.json proxy.
 * - Do not use http://localhost:5000 in .env if you test login on a phone.
 */
export function getApiBaseUrl() {
  const envUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (import.meta.env.DEV) return '/api';
  return PRODUCTION_API;
}

export function getApiOrigin() {
  const base = getApiBaseUrl();
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/\/api\/?$/i, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export function resolveMediaUrl(path) {
  if (!path) return '';
  const value = String(path).trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^\/(images|uploads)\//i.test(value)) {
    return `${getApiOrigin()}${value}`;
  }
  if (value.startsWith('/')) return value;
  return value;
}

export function getGoogleAuthUrl() {
  const returnTo = encodeURIComponent(window.location.origin);
  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  return `${apiBase}/auth/google?returnTo=${returnTo}`;
}

/** Human-readable API target (login + forts use the same server). */
export function getApiConnectionLabel() {
  const base = getApiBaseUrl();
  if (/^https?:\/\//i.test(base)) return base;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${base.startsWith('/') ? base : `/${base}`}`;
  }
  return base;
}

export function isUsingProductionApi() {
  const base = getApiBaseUrl();
  return base.includes('onrender.com') || base.includes('gadkille.co.in');
}

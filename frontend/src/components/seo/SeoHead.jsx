import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildTitle,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  getDefaultOgImage,
  getSiteUrl,
  absoluteUrl
} from '../../lib/seo';

const upsertMeta = (attr, key, content) => {
  if (content == null || content === '') return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
};

const setJsonLd = (schemas) => {
  const id = 'gadkille-seo-jsonld';
  document.getElementById(id)?.remove();
  if (!schemas?.length) return;

  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schemas.length === 1 ? schemas[0] : schemas);
  document.head.appendChild(script);
};

export default function SeoHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
  noindex = false,
  jsonLd = null
}) {
  const location = useLocation();
  const canonicalPath = path ?? location.pathname;
  const pageTitle = buildTitle(title);
  const ogImage = image || getDefaultOgImage();
  const canonicalUrl = absoluteUrl(canonicalPath);
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const jsonLdKey = schemas.length ? JSON.stringify(schemas) : '';

  useEffect(() => {
    document.title = pageTitle;
    document.documentElement.lang = 'en';

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'author', 'GadKille');
    upsertMeta('name', 'application-name', 'GadKille');
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    upsertMeta('name', 'googlebot', noindex ? 'noindex,nofollow' : 'index,follow');

    upsertMeta('property', 'og:title', pageTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:site_name', 'GadKille');
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('property', 'og:image:alt', 'GadKille — Maharashtra fort tourism');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', pageTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);

    upsertLink('canonical', canonicalUrl);
    setJsonLd(jsonLdKey ? JSON.parse(jsonLdKey) : []);

    const verification = String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();
    if (verification) upsertMeta('name', 'google-site-verification', verification);
  }, [pageTitle, description, keywords, noindex, canonicalUrl, ogImage, type, jsonLdKey]);

  return null;
}

export { getSiteUrl };

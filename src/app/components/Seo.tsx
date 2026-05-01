import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogUrl: string;
};

const verification = {
  yandex: import.meta.env.VITE_YANDEX_VERIFICATION,
  google: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION,
  bing: import.meta.env.VITE_BING_SITE_VERIFICATION,
};

function upsertMetaByName(name: string, content: string) {
  let meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let meta = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function setOptionalMetaByName(name: string, value?: string) {
  const normalized = value?.trim();
  const meta = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (!normalized) {
    meta?.remove();
    return;
  }

  upsertMetaByName(name, normalized);
}

export default function Seo({ title, description, canonical, ogType = 'website', ogUrl }: SeoProps) {
  useEffect(() => {
    document.title = title;
    upsertMetaByName('description', description);
    upsertCanonical(canonical);

    upsertMetaByProperty('og:title', title);
    upsertMetaByProperty('og:description', description);
    upsertMetaByProperty('og:type', ogType);
    upsertMetaByProperty('og:url', ogUrl);

    upsertMetaByName('twitter:card', 'summary_large_image');
    upsertMetaByName('twitter:title', title);
    upsertMetaByName('twitter:description', description);

    setOptionalMetaByName('yandex-verification', verification.yandex);
    setOptionalMetaByName('google-site-verification', verification.google);
    setOptionalMetaByName('msvalidate.01', verification.bing);
  }, [title, description, canonical, ogType, ogUrl]);

  return null;
}

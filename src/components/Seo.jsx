import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGES, SITE, absoluteUrl, assetUrl, normalizeRoute } from '../../site.config.mjs';

function ensureMeta(selector, attrs) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  return node;
}

function ensureLink(rel) {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  return node;
}

function buildStructuredData(route, page) {
  const pageUrl = absoluteUrl(route);
  const orgId = `${SITE.siteUrl}/#organization`;
  const websiteId = `${SITE.siteUrl}/#website`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': orgId,
        name: SITE.name,
        url: SITE.siteUrl,
        logo: assetUrl(SITE.logoPath),
        image: assetUrl(SITE.ogImagePath),
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phone,
        address: {
          '@type': 'PostalAddress',
          ...SITE.address,
        },
        sameAs: SITE.socials,
        founder: SITE.founders.map((founder) => ({
          '@type': 'Person',
          name: founder.name,
          jobTitle: founder.jobTitle,
        })),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${SITE.siteUrl}/`,
        name: SITE.name,
        publisher: { '@id': orgId },
      },
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: page.title,
        description: page.description,
        isPartOf: { '@id': websiteId },
        about: { '@id': orgId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: assetUrl(SITE.ogImagePath),
        },
      },
    ],
  };
}

export default function Seo() {
  const location = useLocation();

  useEffect(() => {
    const route = normalizeRoute(location.pathname);
    const page = PAGES[route] || PAGES['/'];
    const canonical = absoluteUrl(route);
    const ogImage = assetUrl(SITE.ogImagePath);

    document.title = page.title;

    ensureMeta('meta[name="description"]', { name: 'description' }).setAttribute('content', page.description);
    ensureMeta('meta[name="robots"]', { name: 'robots' }).setAttribute('content', 'index,follow,max-image-preview:large');

    ensureMeta('meta[property="og:type"]', { property: 'og:type' }).setAttribute('content', 'website');
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name' }).setAttribute('content', SITE.name);
    ensureMeta('meta[property="og:title"]', { property: 'og:title' }).setAttribute('content', page.title);
    ensureMeta('meta[property="og:description"]', { property: 'og:description' }).setAttribute('content', page.description);
    ensureMeta('meta[property="og:url"]', { property: 'og:url' }).setAttribute('content', canonical);
    ensureMeta('meta[property="og:image"]', { property: 'og:image' }).setAttribute('content', ogImage);

    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card' }).setAttribute('content', 'summary_large_image');
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title' }).setAttribute('content', page.title);
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description' }).setAttribute('content', page.description);
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image' }).setAttribute('content', ogImage);

    ensureLink('canonical').setAttribute('href', canonical);

    let schema = document.head.querySelector('#ps-structured-data');
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'ps-structured-data';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(buildStructuredData(route, page));
  }, [location.pathname]);

  return null;
}

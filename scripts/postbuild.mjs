import fs from 'node:fs/promises';
import path from 'node:path';
import { PAGES, ROUTE_ALIASES, SITE, absoluteUrl, assetUrl, normalizeRoute } from '../site.config.mjs';

const distDir = path.resolve('dist');
const rootIndexPath = path.join(distDir, 'index.html');
const baseHtml = await fs.readFile(rootIndexPath, 'utf8');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
        url: `${SITE.siteUrl}/`,
        logo: assetUrl(SITE.logoPath),
        image: assetUrl(SITE.ogImagePath),
        description: SITE.description,
        email: SITE.email,
        telephone: SITE.phone,
        address: { '@type': 'PostalAddress', ...SITE.address },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SITE.geo.latitude,
          longitude: SITE.geo.longitude,
        },
        sameAs: SITE.socials,
        founder: SITE.founders.map((founder) => ({
          '@type': 'Person',
          name: founder.name,
          jobTitle: founder.jobTitle,
        })),
        knowsAbout: SITE.services,
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

function replaceOrInsert(html, pattern, replacement, before = '</head>') {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(before, `  ${replacement}\n${before}`);
}

function renderHtml(route) {
  const normalized = normalizeRoute(route);
  const page = PAGES[normalized] || PAGES['/'];
  const canonical = absoluteUrl(normalized);
  const ogImage = assetUrl(SITE.ogImagePath);
  const schema = JSON.stringify(buildStructuredData(normalized, page)).replace(/</g, '\\u003c');

  let html = baseHtml;
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceOrInsert(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large" />');
  html = replaceOrInsert(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="website" />');
  html = replaceOrInsert(html, /<meta\s+property=["']og:site_name["'][^>]*>/i, `<meta property="og:site_name" content="${escapeHtml(SITE.name)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(page.title)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(page.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  html = replaceOrInsert(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:card["'][^>]*>/i, '<meta name="twitter:card" content="summary_large_image" />');
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`);
  html = replaceOrInsert(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`);

  html = html.replace(/\s*<script\s+type=["']application\/ld\+json["']\s+id=["']ps-static-structured-data["']>[\s\S]*?<\/script>/i, '');
  html = html.replace('</head>', `  <script type="application/ld+json" id="ps-static-structured-data">${schema}</script>\n  </head>`);
  return html;
}

async function writeCleanRoute(route) {
  const routeName = route.replace(/^\//, '');
  const targetDir = route === '/' ? distDir : path.join(distDir, routeName);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, 'index.html'), renderHtml(route), 'utf8');
}

// Root + clean crawlable routes.
for (const route of Object.keys(PAGES)) {
  await writeCleanRoute(route);
}

// Legacy .html URLs remain directly requestable and canonicalize to clean routes.
for (const [alias, canonicalRoute] of Object.entries(ROUTE_ALIASES)) {
  const filename = alias.replace(/^\//, '');
  if (filename === 'index.html') continue;
  await fs.writeFile(path.join(distDir, filename), renderHtml(canonicalRoute), 'utf8');
}

// GitHub Pages fallback. BrowserRouter will render the branded NotFound page.
let notFoundHtml = renderHtml('/');
notFoundHtml = notFoundHtml
  .replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow" />')
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>Page Not Found | Parashoot Studio</title>');
await fs.writeFile(path.join(distDir, '404.html'), notFoundHtml, 'utf8');

const sitemapRoutes = Object.keys(PAGES);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes
  .map((route) => `  <url><loc>${escapeHtml(absoluteUrl(route))}</loc></url>`)
  .join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE.siteUrl}/sitemap.xml\n`;
await fs.writeFile(path.join(distDir, 'robots.txt'), robots, 'utf8');

console.log(`Generated ${sitemapRoutes.length} clean routes, ${Object.keys(ROUTE_ALIASES).length - 1} legacy aliases, sitemap.xml, robots.txt and 404.html.`);

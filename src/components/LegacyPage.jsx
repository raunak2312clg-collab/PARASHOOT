import React, { useLayoutEffect, useRef } from 'react';

const HEAD_MARKER = 'data-parashoot-page-head';
const SCRIPT_MARKER = 'data-parashoot-page-script';

function cloneHeadNode(node) {
  const tag = node.tagName.toLowerCase();

  if (tag === 'style') {
    const style = document.createElement('style');
    style.setAttribute(HEAD_MARKER, 'true');
    style.textContent = node.textContent;
    document.head.appendChild(style);
    return style;
  }

  if (tag === 'link') {
    const link = document.createElement('link');
    for (const attr of node.attributes) link.setAttribute(attr.name, attr.value);
    link.setAttribute(HEAD_MARKER, 'true');
    document.head.appendChild(link);
    return link;
  }

  return null;
}

function addScript(scriptNode) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.setAttribute(SCRIPT_MARKER, 'true');

    for (const attr of scriptNode.attributes) {
      script.setAttribute(attr.name, attr.value);
    }

    if (scriptNode.src) {
      script.async = false;
      script.onload = resolve;
      script.onerror = () => {
        console.warn(`Unable to load external script: ${scriptNode.src}`);
        resolve();
      };
      document.body.appendChild(script);
      return;
    }

    // Each legacy page used to run as its own document. Scope inline JS so
    // repeated const/let declarations do not collide while navigating in React.
    script.textContent = `
      (() => {
        ${scriptNode.textContent}
      })();
    `;
    document.body.appendChild(script);
    resolve();
  });
}

function getInternalRoute(href) {
  if (!href) return null;

  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) return null;

  let path = trimmed;
  let search = '';
  let fragment = '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (!/(^|\.)parashootstudio\.com$/i.test(url.hostname)) return null;
      path = url.pathname;
      search = url.search;
      fragment = url.hash;
    } catch {
      return null;
    }
  } else {
    const hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      fragment = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }

    const queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      search = path.slice(queryIndex);
      path = path.slice(0, queryIndex);
    }
  }

  path = path
    .replace(/^\.\//, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\.html$/, '');

  if (!path || path === 'index') return '/';

  const routeMap = {
    about: '/about',
    services: '/services',
    work: '/work',
    portfolio: '/portfolio',
    advideo: '/ads',
    ads: '/ads',
    careers: '/careers',
    hiring: '/careers',
    connect: '/connect',
    'start-project': '/connect',
    team: '/team',
    clients: '/clients',
  };

  const route = routeMap[path];
  return route ? `${route}${search}${fragment}` : null;
}

function convertLegacyLinks(documentNode) {
  documentNode.querySelectorAll('a[href]').forEach((anchor) => {
    const route = getInternalRoute(anchor.getAttribute('href'));
    if (!route) return;

    anchor.setAttribute('href', `#${route}`);
    anchor.removeAttribute('target');
  });
}

function cleanAssetLabel(value = '') {
  return value
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b(?:img|image|photo|pic)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveAltText(img) {
  const src = img.getAttribute('src') || '';
  const lower = src.toLowerCase();

  if (lower.includes('/sponsors/')) {
    const filename = src.split('/').pop() || '';
    const brand = cleanAssetLabel(filename)
      .replace(/\b(?:white|black|logo|1024x724)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return brand ? `${brand} client logo` : 'Parashoot Studio client logo';
  }

  const categoryLabels = [
    ['food', 'Food photography'],
    ['portrait', 'Portrait photography'],
    ['celebrity', 'Celebrity photography'],
    ['nightlife', 'Nightlife photography'],
    ['sports', 'Sports photography'],
    ['brands', 'Brand photography'],
    ['aerial', 'Aerial photography'],
    ['bts', 'Behind the scenes'],
    ['jewellery', 'Jewellery photography'],
    ['property', 'Property photography'],
    ['career', 'Parashoot Studio team'],
  ];

  const category = categoryLabels.find(([key]) => lower.includes(`/${key}/`));
  if (category) return `${category[1]} by Parashoot Studio`;

  const nearbyHeading = img.closest('article, section, figure, .card, .service-card, .work-card, .team-card')
    ?.querySelector('h1, h2, h3, h4, figcaption');
  if (nearbyHeading?.textContent?.trim()) return nearbyHeading.textContent.trim();

  return 'Parashoot Studio creative work';
}

function enhanceMedia(documentNode) {
  let priorityImages = 0;

  documentNode.querySelectorAll('img').forEach((img) => {
    img.setAttribute('decoding', 'async');

    const hiddenChrome = img.closest('nav, .mobile-menu, footer');
    const isHero = Boolean(img.closest('.hero, .page-hero, .hero-photo, .work-hero, .about-hero, .team-hero, .services-hero'));
    const shouldEagerLoad = !hiddenChrome && (isHero || priorityImages < 2);

    if (shouldEagerLoad) {
      img.setAttribute('loading', 'eager');
      if (priorityImages === 0) img.setAttribute('fetchpriority', 'high');
      priorityImages += 1;
    } else {
      img.setAttribute('loading', 'lazy');
    }

    const currentAlt = img.getAttribute('alt');
    if ((currentAlt === null || currentAlt.trim() === '') && img.getAttribute('aria-hidden') !== 'true') {
      img.setAttribute('alt', deriveAltText(img));
    }
  });

  documentNode.querySelectorAll('iframe').forEach((iframe) => {
    if (!iframe.hasAttribute('loading')) iframe.setAttribute('loading', 'lazy');
  });

  documentNode.querySelectorAll('video').forEach((video) => {
    video.setAttribute('preload', 'metadata');
    if (video.hasAttribute('autoplay')) {
      video.removeAttribute('autoplay');
      video.setAttribute('data-autoplay-on-view', 'true');
    }
  });
}

function setMetaContent(selector, content) {
  if (!content) return;
  const node = document.head.querySelector(selector);
  if (node) node.setAttribute('content', content);
}

function applyPageMeta(pageDocument) {
  if (pageDocument.title) document.title = pageDocument.title;

  const description = pageDocument.querySelector('meta[name="description"]')?.getAttribute('content');
  if (description) {
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:description"]', description);
  }

  if (pageDocument.title) {
    setMetaContent('meta[property="og:title"]', pageDocument.title);
    setMetaContent('meta[name="twitter:title"]', pageDocument.title);
  }
}

function setupDeferredVideoPlayback(mountNode) {
  const videos = Array.from(mountNode.querySelectorAll('video[data-autoplay-on-view="true"]'));
  if (!videos.length || !('IntersectionObserver' in window)) return () => {};

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '200px 0px', threshold: [0, 0.2, 0.6] });

  videos.forEach((video) => observer.observe(video));
  return () => observer.disconnect();
}


function setupRouteAnchorScroll() {
  const hashParts = window.location.hash.split('#');
  if (hashParts.length < 3) return () => {};

  const targetId = decodeURIComponent(hashParts.slice(2).join('#'));
  const timer = window.setTimeout(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 350);

  return () => window.clearTimeout(timer);
}

export default function LegacyPage({ source }) {
  const mountRef = useRef(null);

  useLayoutEffect(() => {
    const parser = new DOMParser();
    const pageDocument = parser.parseFromString(source, 'text/html');
    const mountNode = mountRef.current;

    if (!mountNode) return undefined;

    window.scrollTo(0, 0);

    document.querySelectorAll(`[${HEAD_MARKER}]`).forEach((node) => node.remove());
    document.querySelectorAll(`[${SCRIPT_MARKER}]`).forEach((node) => node.remove());

    applyPageMeta(pageDocument);
    convertLegacyLinks(pageDocument);
    enhanceMedia(pageDocument);

    const injectedHeadNodes = [];
    pageDocument.head.querySelectorAll('link, style').forEach((node) => {
      const injected = cloneHeadNode(node);
      if (injected) injectedHeadNodes.push(injected);
    });

    const bodyClone = pageDocument.body.cloneNode(true);
    bodyClone.querySelectorAll('script').forEach((node) => node.remove());
    // V2 renders one shared React footer. The legacy footer copy is no longer mounted.
    bodyClone.querySelectorAll('footer').forEach((node) => node.remove());
    mountNode.innerHTML = bodyClone.innerHTML;

    const cleanupVideoPlayback = setupDeferredVideoPlayback(mountNode);
    const cleanupRouteAnchor = setupRouteAnchorScroll();
    const scriptNodes = Array.from(pageDocument.querySelectorAll('script'));
    let cancelled = false;

    (async () => {
      for (const scriptNode of scriptNodes) {
        if (cancelled) break;
        await addScript(scriptNode);
      }
    })();

    return () => {
      cancelled = true;
      cleanupVideoPlayback();
      cleanupRouteAnchor();
      injectedHeadNodes.forEach((node) => node.remove());
      document.querySelectorAll(`[${SCRIPT_MARKER}]`).forEach((node) => node.remove());
      mountNode.innerHTML = '';
      document.body.style.overflow = '';
    };
  }, [source]);

  return <div className="react-legacy-page" ref={mountRef} />;
}

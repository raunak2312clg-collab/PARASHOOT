import React, { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HEAD_MARKER = 'data-parashoot-page-head';
const SCRIPT_MARKER = 'data-parashoot-page-script';

function rewriteLegacyAssetPaths(source) {
  const base = import.meta.env.BASE_URL;
  return source.replace(/([\'"`(=])(?:\.\/)?assets\//g, `$1${base}assets/`);
}

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
    const href = node.getAttribute('href') || '';
    if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')) return null;

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

    for (const attr of scriptNode.attributes) script.setAttribute(attr.name, attr.value);

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

    // Each legacy page originally ran as its own document. Scope inline JS so
    // const/let declarations from one route cannot collide with another route.
    script.textContent = `(() => {\n${scriptNode.textContent}\n})();`;
    document.body.appendChild(script);
    resolve();
  });
}

function getInternalRoute(href) {
  if (!href) return null;

  const trimmed = href.trim();
  if (!trimmed || trimmed === '#') return null;
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) return null;

  if (trimmed.startsWith('#')) return trimmed;

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
    .replace(/^\/PARASHOOT\//i, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .replace(/\.html$/, '');

  if (!path || path === 'index') return `/${search}${fragment}`;

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

function toPublicHref(route) {
  if (route.startsWith('#')) return route;

  const match = route.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] || '/';
  const suffix = match?.[2] || '';
  const base = import.meta.env.BASE_URL;
  const routePath = pathname === '/' ? '' : `${pathname.replace(/^\/+|\/+$/g, '')}/`;
  return `${base}${routePath}${suffix}`;
}

function convertLegacyLinks(documentNode) {
  documentNode.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    const route = getInternalRoute(href);

    if (route) {
      if (route.startsWith('#')) {
        anchor.setAttribute('href', route);
      } else {
        anchor.setAttribute('href', toPublicHref(route));
        anchor.setAttribute('data-ps-route', route);
        anchor.removeAttribute('target');
      }
    }

    if (anchor.getAttribute('target') === '_blank') {
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
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
  // Keep photography loading behaviour intact: V3 does not blanket-lazy-load images.
  documentNode.querySelectorAll('img').forEach((img) => {
    const currentAlt = img.getAttribute('alt');
    const decorative = img.getAttribute('aria-hidden') === 'true'
      || img.closest('.service-bg, .hero-photo, .page-hero-bg, .work-bg');

    if (!decorative && (currentAlt === null || currentAlt.trim() === '')) {
      img.setAttribute('alt', deriveAltText(img));
    }
  });

  documentNode.querySelectorAll('iframe').forEach((iframe) => {
    if (!iframe.hasAttribute('loading')) iframe.setAttribute('loading', 'lazy');
    if (!iframe.hasAttribute('title')) iframe.setAttribute('title', 'Embedded media');
  });

  documentNode.querySelectorAll('video').forEach((video) => {
    video.setAttribute('preload', 'metadata');
    video.setAttribute('playsinline', '');
    if (video.hasAttribute('autoplay')) {
      video.removeAttribute('autoplay');
      video.setAttribute('data-autoplay-on-view', 'true');
    }
  });
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

function setupInternalNavigation(mountNode, navigate) {
  const handleClick = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a[data-ps-route]');
    if (!anchor || !mountNode.contains(anchor)) return;

    const route = anchor.getAttribute('data-ps-route');
    if (!route) return;

    event.preventDefault();
    navigate(route);
  };

  mountNode.addEventListener('click', handleClick);
  return () => mountNode.removeEventListener('click', handleClick);
}

function setupRouteAnchorScroll() {
  const targetId = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (!targetId) return () => {};

  const timer = window.setTimeout(() => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 250);

  return () => window.clearTimeout(timer);
}

export default function LegacyPage({ source }) {
  const mountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useLayoutEffect(() => {
    const parser = new DOMParser();
    const pageDocument = parser.parseFromString(rewriteLegacyAssetPaths(source), 'text/html');
    const mountNode = mountRef.current;

    if (!mountNode) return undefined;

    if (!location.hash) window.scrollTo(0, 0);

    document.querySelectorAll(`[${HEAD_MARKER}]`).forEach((node) => node.remove());
    document.querySelectorAll(`[${SCRIPT_MARKER}]`).forEach((node) => node.remove());

    convertLegacyLinks(pageDocument);
    enhanceMedia(pageDocument);

    const injectedHeadNodes = [];
    pageDocument.head.querySelectorAll('link, style').forEach((node) => {
      const injected = cloneHeadNode(node);
      if (injected) injectedHeadNodes.push(injected);
    });

    const bodyClone = pageDocument.body.cloneNode(true);
    bodyClone.querySelectorAll('script').forEach((node) => node.remove());
    bodyClone.querySelectorAll('footer').forEach((node) => node.remove());
    mountNode.innerHTML = bodyClone.innerHTML;

    const cleanupNavigation = setupInternalNavigation(mountNode, navigate);
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
      cleanupNavigation();
      cleanupVideoPlayback();
      cleanupRouteAnchor();
      injectedHeadNodes.forEach((node) => node.remove());
      document.querySelectorAll(`[${SCRIPT_MARKER}]`).forEach((node) => node.remove());
      mountNode.innerHTML = '';
      document.body.style.overflow = '';
    };
  }, [source, navigate, location.pathname, location.search, location.hash]);

  return <div className="react-legacy-page" ref={mountRef} />;
}

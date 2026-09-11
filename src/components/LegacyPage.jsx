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

    for (const attr of node.attributes) {
      link.setAttribute(attr.name, attr.value);
    }

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

    // Legacy pages were originally standalone HTML documents. Running their
    // inline scripts directly in the React shell puts top-level const/let
    // declarations in the same global scope on every navigation, which
    // causes errors such as "Identifier 'hamburger' has already been declared".
    // Scope each page's inline script to its own function instead.
    script.textContent = `
      (() => {
        ${scriptNode.textContent}
      })();
    `;
    document.body.appendChild(script);

    resolve();
  });
}

function convertLegacyLinks(documentNode) {
  documentNode.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');

    if (!href) return;

    const trimmedHref = href.trim();

    // Leave external/special links untouched
    if (
      trimmedHref.startsWith('http://') ||
      trimmedHref.startsWith('https://') ||
      trimmedHref.startsWith('mailto:') ||
      trimmedHref.startsWith('tel:') ||
      trimmedHref.startsWith('javascript:') ||
      trimmedHref.startsWith('#')
    ) {
      return;
    }

    // Remove ./ or leading /
    let path = trimmedHref
      .replace(/^\.\//, '')
      .replace(/^\//, '');

    // Home page
    if (
      path === '' ||
      path === 'index.html' ||
      path === 'index'
    ) {
      anchor.setAttribute('href', '#/');
      return;
    }

    // Convert internal HTML/page links to HashRouter URLs
    const internalPages = [
      'about',
      'services',
      'work',
      'portfolio',
      'advideo',
      'ads',
      'careers',
      'connect',
      'team',
      'clients'
    ];

    const cleanPath = path.replace(/\.html$/, '');

    if (internalPages.includes(cleanPath)) {
      // Use /ads because App.jsx uses that cleaner route
      if (cleanPath === 'advideo') {
        anchor.setAttribute('href', '#/ads');
      } else {
        anchor.setAttribute('href', `#/${cleanPath}`);
      }
    }
  });
}

export default function LegacyPage({ source }) {
  const mountRef = useRef(null);

  useLayoutEffect(() => {
    const parser = new DOMParser();
    const pageDocument = parser.parseFromString(source, 'text/html');
    const mountNode = mountRef.current;

    if (!mountNode) return undefined;

    window.scrollTo(0, 0);

    document
      .querySelectorAll(`[${HEAD_MARKER}]`)
      .forEach((node) => node.remove());

    document
      .querySelectorAll(`[${SCRIPT_MARKER}]`)
      .forEach((node) => node.remove());

    if (pageDocument.title) {
      document.title = pageDocument.title;
    }

    // Convert old HTML navigation to HashRouter navigation
    convertLegacyLinks(pageDocument);

    const injectedHeadNodes = [];

    pageDocument.head
      .querySelectorAll('link, style')
      .forEach((node) => {
        const injected = cloneHeadNode(node);

        if (injected) {
          injectedHeadNodes.push(injected);
        }
      });

    const bodyClone = pageDocument.body.cloneNode(true);

    bodyClone
      .querySelectorAll('script')
      .forEach((node) => node.remove());

    mountNode.innerHTML = bodyClone.innerHTML;

    const scriptNodes = Array.from(
      pageDocument.querySelectorAll('script')
    );

    let cancelled = false;

    (async () => {
      for (const scriptNode of scriptNodes) {
        if (cancelled) break;

        await addScript(scriptNode);
      }
    })();

    return () => {
      cancelled = true;

      injectedHeadNodes.forEach((node) => node.remove());

      document
        .querySelectorAll(`[${SCRIPT_MARKER}]`)
        .forEach((node) => node.remove());

      mountNode.innerHTML = '';

      document.body.style.overflow = '';
    };
  }, [source]);

  return (
    <div
      className="react-legacy-page"
      ref={mountRef}
    />
  );
}
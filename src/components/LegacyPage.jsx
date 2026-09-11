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

    script.textContent = scriptNode.textContent;
    document.body.appendChild(script);
    resolve();
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

    document.querySelectorAll(`[${HEAD_MARKER}]`).forEach((node) => node.remove());
    document.querySelectorAll(`[${SCRIPT_MARKER}]`).forEach((node) => node.remove());

    if (pageDocument.title) document.title = pageDocument.title;

    const injectedHeadNodes = [];
    pageDocument.head.querySelectorAll('link, style').forEach((node) => {
      const injected = cloneHeadNode(node);
      if (injected) injectedHeadNodes.push(injected);
    });

    const bodyClone = pageDocument.body.cloneNode(true);
    bodyClone.querySelectorAll('script').forEach((node) => node.remove());
    mountNode.innerHTML = bodyClone.innerHTML;

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
      injectedHeadNodes.forEach((node) => node.remove());
      document.querySelectorAll(`[${SCRIPT_MARKER}]`).forEach((node) => node.remove());
      mountNode.innerHTML = '';
      document.body.style.overflow = '';
    };
  }, [source]);

  return <div className="react-legacy-page" ref={mountRef} />;
}

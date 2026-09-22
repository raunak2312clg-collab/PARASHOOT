import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/', match: ['/', '/index.html'] },
  { label: 'About Studio', to: '/about', match: ['/about', '/about.html'] },
  { label: 'Services', to: '/services', match: ['/services', '/services.html'] },
  { label: 'Portfolio', to: '/work', match: ['/work', '/work.html', '/portfolio', '/portfolio.html'] },
  { label: 'Team', to: '/team', match: ['/team', '/team.html'] },
  { label: 'Clients', to: '/clients', match: ['/clients', '/clients.html'] },
  { label: 'Careers', to: '/careers', match: ['/careers', '/careers.html'] },
  { label: 'Connect', to: '/connect', match: ['/connect', '/connect.html'] },
];

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

export default function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}assets/images/Parashoot-Logo.png`;
  const currentPath = useMemo(() => normalizePath(location.pathname), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const isActive = (item) => item.match.some((path) => normalizePath(path) === currentPath);

  return (
    <>
      <nav className={`ps-shell-nav${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary navigation">
        <Link className="ps-shell-nav-logo" to="/" aria-label="Parashoot Studio home">
          <img src={logoSrc} alt="Parashoot Studio" />
        </Link>

        <div className="ps-shell-nav-links" aria-label="Main menu">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={isActive(item) ? 'is-active' : ''}
              aria-current={isActive(item) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link className="ps-shell-nav-cta" to="/connect">Start a Project</Link>

        <button
          className={`ps-shell-menu-toggle${menuOpen ? ' is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="ps-mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <nav
        id="ps-mobile-menu"
        className={`ps-shell-mobile-menu${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={isActive(item) ? 'is-active' : ''}
            aria-current={isActive(item) ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link className="ps-shell-mobile-cta" to="/connect" onClick={() => setMenuOpen(false)}>
          Start a Project →
        </Link>
      </nav>
    </>
  );
}

import React, { useEffect, useState } from 'react';
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

export default function SiteHeader() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}assets/images/Parashoot-Logo.png`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const isActive = (item) => item.match.includes(location.pathname);

  return (
    <>
      <div className={`ps-shell-nav${scrolled ? ' is-scrolled' : ''}`} role="navigation" aria-label="Primary navigation">
        <Link className="ps-shell-nav-logo" to="/" aria-label="Parashoot Studio home">
          <img src={logoSrc} alt="Parashoot Studio" />
        </Link>

        <div className="ps-shell-nav-links" aria-label="Main menu">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={isActive(item) ? 'is-active' : ''}
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
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`ps-shell-mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={isActive(item) ? 'is-active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link className="ps-shell-mobile-cta" to="/connect" onClick={() => setMenuOpen(false)}>
          Start a Project →
        </Link>
      </div>
    </>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const logoSrc = `${import.meta.env.BASE_URL}assets/images/Parashoot-Logo.png`;
  const year = new Date().getFullYear();

  return (
    <footer className="ps-shell-footer">
      <div className="ps-shell-footer-grid">
        <div className="ps-shell-footer-brand">
          <img src={logoSrc} alt="Parashoot Studio" />
          <p>Goa-based photography and film production for brands, events, campaigns and people.</p>
          <div className="ps-shell-footer-socials" aria-label="Social media">
            <a href="https://www.facebook.com/parashoot.studio/" target="_blank" rel="noopener noreferrer" aria-label="Parashoot Studio on Facebook">f</a>
            <a href="https://www.linkedin.com/in/parashoot-studio-216860231/" target="_blank" rel="noopener noreferrer" aria-label="Parashoot Studio on LinkedIn">in</a>
            <a href="https://instagram.com/parashoot.studio" target="_blank" rel="noopener noreferrer" aria-label="Parashoot Studio on Instagram">ig</a>
            <a href="https://www.youtube.com/channel/UCuFtcVt_Yp9CZ82UG6pm-pg" target="_blank" rel="noopener noreferrer" aria-label="Parashoot Studio on YouTube">yt</a>
          </div>
        </div>

        <div className="ps-shell-footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/work">Selected Work</Link></li>
            <li><Link to="/portfolio">Full Portfolio</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/team">Team</Link></li>
            <li><Link to="/clients">Clients</Link></li>
          </ul>
        </div>

        <div className="ps-shell-footer-col">
          <h4>Studio</h4>
          <ul>
            <li><Link to="/about">About Studio</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/connect">Start a Project</Link></li>
            <li><a href="mailto:contact@parashootstudio.com">contact@parashootstudio.com</a></li>
            <li><a href="tel:+919405950268">+91 94059 50268</a></li>
          </ul>
        </div>

        <div className="ps-shell-footer-col">
          <h4>Margao, Goa</h4>
          <p className="ps-shell-footer-address">
            G26 Vikrant Complex,<br />
            Next to State Bank of India (PBB),<br />
            Opposite Luis &amp; Company,<br />
            Malbhat, Margao, Goa — 403601
          </p>
        </div>
      </div>

      <div className="ps-shell-footer-bottom">
        <span>© {year} Parashoot Studio. All rights reserved.</span>
        <span>
          Website by{' '}
          <a href="https://cybercreative.in/" target="_blank" rel="noopener noreferrer">Cyber Creative</a>
        </span>
      </div>
    </footer>
  );
}

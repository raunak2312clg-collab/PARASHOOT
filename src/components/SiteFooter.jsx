import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  const logoSrc = `${import.meta.env.BASE_URL}assets/images/Parashoot-Logo.png`;
  const year = new Date().getFullYear();

  return (
    <div className="ps-shell-footer" role="contentinfo">
      <div className="ps-shell-footer-grid">
        <div className="ps-shell-footer-brand">
          <img src={logoSrc} alt="Parashoot Studio" />
          <p>Goa&apos;s leading creative studio — photography, film, aerial &amp; post-production content.</p>
          <div className="ps-shell-footer-socials" aria-label="Social media">
            <a href="https://www.facebook.com/parashoot.studio/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
            <a href="https://www.linkedin.com/in/parashoot-studio-216860231/" target="_blank" rel="noreferrer" aria-label="LinkedIn">in</a>
            <a href="https://instagram.com/parashoot.studio" target="_blank" rel="noreferrer" aria-label="Instagram">ig</a>
            <a href="https://www.youtube.com/channel/UCuFtcVt_Yp9CZ82UG6pm-pg" target="_blank" rel="noreferrer" aria-label="YouTube">yt</a>
          </div>
        </div>

        <div className="ps-shell-footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Studio</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/work">Portfolio</Link></li>
            <li><Link to="/connect">Connect</Link></li>
          </ul>
        </div>

        <div className="ps-shell-footer-col">
          <h4>Ecosystem</h4>
          <ul>
            <li><a href="https://www.flashlabcreative.com/services/" target="_blank" rel="noreferrer">Digital Marketing</a></li>
            <li><a href="https://cybercreative.in/services/" target="_blank" rel="noreferrer">Web &amp; App Dev</a></li>
            <li><a href="https://backstagexchange.com/" target="_blank" rel="noreferrer">Event Activation</a></li>
          </ul>
        </div>

        <div className="ps-shell-footer-col">
          <h4>Location</h4>
          <p className="ps-shell-footer-address">
            G26 Vikrant Complex,<br />
            Next to State Bank of India (PBB),<br />
            Opposite Luis &amp; Company,<br />
            Malbhat Margao, Goa — 403601
          </p>
        </div>
      </div>

      <div className="ps-shell-footer-bottom">
        <span>Copyright © 2022 – {year} Parashoot Studio</span>
        <span>
          Designed and Developed by{' '}
          <a href="https://cybercreative.in/" target="_blank" rel="noreferrer">Cyber Creative</a>
        </span>
      </div>
    </div>
  );
}

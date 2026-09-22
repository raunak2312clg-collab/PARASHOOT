import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="ps-not-found" aria-labelledby="ps-not-found-title">
      <p className="ps-not-found-kicker">404 — FRAME NOT FOUND</p>
      <h1 id="ps-not-found-title">THIS PAGE IS OUT OF FRAME.</h1>
      <p>The page may have moved, or the link may be outdated.</p>
      <div className="ps-not-found-actions">
        <Link to="/">Back Home</Link>
        <Link to="/work">View Work</Link>
      </div>
    </section>
  );
}

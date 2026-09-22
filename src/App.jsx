import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LegacyPage from './components/LegacyPage.jsx';
import NotFound from './components/NotFound.jsx';
import Seo from './components/Seo.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';

import homeHtml from './original-pages/index.html?raw';
import aboutHtml from './original-pages/about.html?raw';
import servicesHtml from './original-pages/services.html?raw';
import workHtml from './original-pages/work.html?raw';
import portfolioHtml from './original-pages/portfolio.html?raw';
import adVideoHtml from './original-pages/advideo.html?raw';
import careersHtml from './original-pages/careers.html?raw';
import connectHtml from './original-pages/connect.html?raw';
import teamHtml from './original-pages/team.html?raw';
import clientsHtml from './original-pages/clients.html?raw';

const Page = ({ source }) => <LegacyPage source={source} />;

export default function App() {
  return (
    <>
      <Seo />
      <a className="ps-skip-link" href="#main-content">Skip to content</a>
      <SiteHeader />

      <main id="main-content" className="ps-main" tabIndex="-1">
        <Routes>
          <Route path="/" element={<Page source={homeHtml} />} />
          <Route path="/index.html" element={<Page source={homeHtml} />} />

          <Route path="/about" element={<Page source={aboutHtml} />} />
          <Route path="/about.html" element={<Page source={aboutHtml} />} />
          <Route path="/services" element={<Page source={servicesHtml} />} />
          <Route path="/services.html" element={<Page source={servicesHtml} />} />
          <Route path="/work" element={<Page source={workHtml} />} />
          <Route path="/work.html" element={<Page source={workHtml} />} />
          <Route path="/portfolio" element={<Page source={portfolioHtml} />} />
          <Route path="/portfolio.html" element={<Page source={portfolioHtml} />} />
          <Route path="/ads" element={<Page source={adVideoHtml} />} />
          <Route path="/advideo.html" element={<Page source={adVideoHtml} />} />
          <Route path="/careers" element={<Page source={careersHtml} />} />
          <Route path="/careers.html" element={<Page source={careersHtml} />} />
          <Route path="/connect" element={<Page source={connectHtml} />} />
          <Route path="/connect.html" element={<Page source={connectHtml} />} />
          <Route path="/team" element={<Page source={teamHtml} />} />
          <Route path="/team.html" element={<Page source={teamHtml} />} />
          <Route path="/clients" element={<Page source={clientsHtml} />} />
          <Route path="/clients.html" element={<Page source={clientsHtml} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <SiteFooter />
    </>
  );
}

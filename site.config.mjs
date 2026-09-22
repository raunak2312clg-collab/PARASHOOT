export const SITE = {
  name: 'Parashoot Studio',
  siteUrl: 'https://raunak2312clg-collab.github.io/PARASHOOT',
  description: 'Parashoot Studio is a Goa-based photography and film production studio creating commercial photography, brand films, event coverage, aerial content, social content and post-production.',
  logoPath: '/assets/images/Parashoot-Logo.png',
  ogImagePath: '/assets/images/home/dariusz-sankowski-mj2NwYH3wBA-unsplash.jpg',
  email: 'contact@parashootstudio.com',
  phone: '+919405950268',
  address: {
    streetAddress: 'G26 Vikrant Complex, Malbhat',
    addressLocality: 'Margao',
    addressRegion: 'Goa',
    postalCode: '403601',
    addressCountry: 'IN',
  },
  geo: {
    latitude: 15.270369,
    longitude: 73.961421,
  },
  socials: [
    'https://www.facebook.com/parashoot.studio/',
    'https://www.linkedin.com/in/parashoot-studio-216860231/',
    'https://instagram.com/parashoot.studio',
    'https://www.youtube.com/channel/UCuFtcVt_Yp9CZ82UG6pm-pg',
  ],
  founders: [
    { name: 'Anuraj Kedar', jobTitle: 'Founder & Creative Director' },
    { name: 'Ankith Kedar', jobTitle: 'Co-Founder & Strategy Lead' },
  ],
  services: [
    'Commercial Photography',
    'Film & Video Production',
    'Event Coverage',
    'Drone & Aerial Production',
    'Social Content Production',
    'Post-Production',
    'Weddings & Celebrations',
  ],
};

export const PAGES = {
  '/': {
    title: 'Parashoot Studio | Photography & Film Production in Goa',
    description: 'Goa-based photography and film studio for commercial shoots, brand films, events, aerial coverage, social content and post-production.',
  },
  '/about': {
    title: 'About Parashoot Studio | Goa Photography & Film Team',
    description: 'Meet Parashoot Studio, a Goa-based photography and film production team working across commercial content, events, aerial and post-production.',
  },
  '/services': {
    title: 'Photography & Video Production Services in Goa | Parashoot Studio',
    description: 'Commercial photography, brand films, event coverage, drone and aerial production, post-production, weddings and social content from Goa.',
  },
  '/work': {
    title: 'Selected Work | Parashoot Studio Photography & Film',
    description: 'Explore selected photography, commercial film, event, brand and aerial projects created by Parashoot Studio in Goa and beyond.',
  },
  '/portfolio': {
    title: 'Photography & Film Portfolio | Parashoot Studio Goa',
    description: 'Browse Parashoot Studio’s photography and film archive across portraits, food, brands, nightlife, sports, aerial, jewellery, property and more.',
  },
  '/ads': {
    title: 'Commercial Films & Advertising Videos | Parashoot Studio',
    description: 'Watch commercial films, brand videos and advertising work produced by Parashoot Studio for businesses, campaigns and events.',
  },
  '/team': {
    title: 'Team | Parashoot Studio Goa',
    description: 'Meet the photographers, filmmakers, editors and production team behind Parashoot Studio, led by Anuraj Kedar and Ankith Kedar.',
  },
  '/clients': {
    title: 'Clients | Parashoot Studio Photography & Film',
    description: 'Brands, hospitality groups, sports teams, venues and organisations that have worked with Parashoot Studio on photography and film projects.',
  },
  '/careers': {
    title: 'Careers | Parashoot Studio Goa',
    description: 'Explore creative career opportunities at Parashoot Studio in Goa across cinematography, photography, editing and social content.',
  },
  '/connect': {
    title: 'Contact Parashoot Studio | Photography & Film Enquiries Goa',
    description: 'Contact Parashoot Studio in Margao, Goa for photography, film, event, aerial, post-production and commercial content enquiries.',
  },
};

export const ROUTE_ALIASES = {
  '/index.html': '/',
  '/about.html': '/about',
  '/services.html': '/services',
  '/work.html': '/work',
  '/portfolio.html': '/portfolio',
  '/advideo.html': '/ads',
  '/careers.html': '/careers',
  '/connect.html': '/connect',
  '/team.html': '/team',
  '/clients.html': '/clients',
};

export function normalizeRoute(pathname = '/') {
  let path = pathname || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/+$/, '') || '/';
  return ROUTE_ALIASES[path] || path;
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}/`;
  return `${SITE.siteUrl}${clean}`;
}

export function assetUrl(path) {
  return `${SITE.siteUrl}/${String(path).replace(/^\/+/, '')}`;
}

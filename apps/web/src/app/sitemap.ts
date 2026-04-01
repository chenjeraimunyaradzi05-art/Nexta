import { MetadataRoute } from 'next';

const BASE_URL =
  process.env.DEPLOY_PRIME_URL ||
  process.env.URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://nexta.life' : 'http://localhost:3000');

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/jobs',
    '/courses',
    '/mentorship',
    '/events',
    '/community',
    '/pricing',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/accessibility',
    '/signin',
    '/signup',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: currentDate,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1.0 : path === '/jobs' ? 0.9 : 0.8,
  }));

  // Category pages
  const categoryPages = [
    '/career',
    '/career/skills',
    '/career/portfolio',
    '/apprenticeships',
    '/government',
    '/housing',
    '/resources',
  ];

  const categoryEntries: MetadataRoute.Sitemap = categoryPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries];
}

export default function sitemap() {
  const baseUrl = 'https://ytmbd.work';
  
  const routes = [
    '',
    '/jobs',
    '/help-center',
    '/safety-tips',
    '/contact-us',
    '/founder',
    '/legal',
    '/terms-of-service',
    '/privacy-policy',
    '/refund-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return routes;
}

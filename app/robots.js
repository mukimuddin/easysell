export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/buyer/',
        '/employee/',
        '/api/',
      ],
    },
    sitemap: 'https://ytmbd.work/sitemap.xml',
  }
}

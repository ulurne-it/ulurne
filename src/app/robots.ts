import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth/', '/api/', '/settings/'],
    },
    sitemap: 'https://ulurne.com/sitemap.xml',
  };
}

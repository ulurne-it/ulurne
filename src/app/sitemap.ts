import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ulurne.com';

  // In a real scenario, you might fetch dynamic routes (e.g., profiles, videos) from your DB
  // For now, we'll list the main public entry points.
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    // Add more public pages as they are identified
  ];
}

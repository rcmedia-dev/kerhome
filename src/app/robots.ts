import { type MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/propriedades', '/propriedades/', '/imobiliaria/', '/agente/', '/noticias/', '/sobre', '/contato', '/planos', '/imobiliarias'],
        disallow: ['/dashboard', '/dashboard/', '/admin/', '/login', '/signup', '/api/', '/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

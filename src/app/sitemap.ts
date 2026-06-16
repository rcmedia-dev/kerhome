import { type MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kercasa.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/propriedades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/imobiliarias`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/noticias`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/sobre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contato`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/planos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [{ data: properties }, { data: agencies }, { data: agents }, { data: citiesData }] = await Promise.all([
    supabase.from('properties').select('slug, updated_at, cidade, bairro').eq('aprovement_status', 'approved').not('slug', 'is', null),
    supabase.from('imobiliarias').select('slug, updated_at').eq('status', 'approved').not('slug', 'is', null),
    supabase.from('profiles').select('id, updated_at').eq('role', 'agent'),
    supabase.from('properties').select('cidade, bairro').eq('aprovement_status', 'approved'),
  ]);

  const propertyPages: MetadataRoute.Sitemap = (properties || []).map((p) => ({
    url: `${SITE_URL}/propriedades/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Unique cities and neighborhoods for local SEO pages
  const citySet = new Set<string>();
  const bairroSet = new Set<string>();
  (citiesData || []).forEach((p: any) => {
    if (p.cidade) citySet.add(p.cidade.toLowerCase().replace(/\s+/g, '-'));
    if (p.cidade && p.bairro) bairroSet.add(`${p.cidade.toLowerCase().replace(/\s+/g, '-')}/${p.bairro.toLowerCase().replace(/\s+/g, '-')}`);
  });
  const cityPages: MetadataRoute.Sitemap = Array.from(citySet).map((cidade) => ({
    url: `${SITE_URL}/imoveis-em/${cidade}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  const bairroPages: MetadataRoute.Sitemap = Array.from(bairroSet).map((path) => ({
    url: `${SITE_URL}/imoveis-em/${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const agencyPages: MetadataRoute.Sitemap = (agencies || []).map((a) => ({
    url: `${SITE_URL}/imobiliaria/${a.slug}`,
    lastModified: new Date(a.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const agentPages: MetadataRoute.Sitemap = (agents || []).map((a) => ({
    url: `${SITE_URL}/agente/${a.id}`,
    lastModified: new Date(a.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { fetchPosts } = await import('@/lib/functions/supabase-actions/posts-actions');
    const posts = await fetchPosts(1, 200);
    blogPages = (posts || []).map((post: any) => ({
      url: `${SITE_URL}/noticias/${post.slug}`,
      lastModified: new Date(post.createdAt || post.updatedAt || Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
  } catch {}

  return [...staticPages, ...propertyPages, ...cityPages, ...bairroPages, ...agencyPages, ...agentPages, ...blogPages];
}

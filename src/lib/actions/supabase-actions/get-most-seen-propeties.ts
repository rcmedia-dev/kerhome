import { supabase } from "@/lib/supabase";

export async function getMostViewedProperties(userId?: string) {
  const { data: views, error: errorViews } = await supabase
    .from('property_views')
    .select('property_id')
    .eq('owner_id', userId);

  if (errorViews) {
    console.error('Erro ao buscar visualizações:', errorViews);
    return [];
  }

  // conta quantas vezes cada property_id aparece
  const viewCounts: Record<string, number> = {};
  views.forEach(v => {
    viewCounts[v.property_id] = (viewCounts[v.property_id] || 0) + 1;
  });

  const propertyIds = Object.keys(viewCounts);

  const { data: properties, error: errorProps } = await supabase
    .from('properties')
    .select('*')
    .in('id', propertyIds);

  if (errorProps) {
    console.error('Erro ao buscar propriedades:', errorProps);
    return [];
  }

  // juntar as propriedades com o número de views
  const enriched = (properties || []).map(p => ({
    ...p,
    total_views: viewCounts[p.id] || 0
  }));

  return enriched;
}

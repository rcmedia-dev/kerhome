import { supabase } from "@/lib/supabase";
import { TPropertyResponseSchema } from "@/lib/types/property";

// Linha da tabela property_views com join em properties
type PropertyViewRow = {
  property_id: string;
  properties: TPropertyResponseSchema;
};

// Tipo final do retorno
export type TMyPropertiesWithViews = {
  properties: (TPropertyResponseSchema & { total_views: number })[];
  total_views_all: number;
};

export async function getMyPropertiesWithViews(
  ownerId?: string
): Promise<TMyPropertiesWithViews> {
  const { data: views, error } = await supabase
    .from("property_views")
    .select(
      `
      property_id,
      properties!inner (*)
    `
    )
    .eq("properties.owner_id", ownerId);

  if (error) {
    console.error("Erro ao buscar views:", error);
    return { properties: [], total_views_all: 0 };
  }

  if (!views || views.length === 0) {
    return { properties: [], total_views_all: 0 };
  }

  // Forçar tipagem
  const typedViews = (views as any[]).map(
    (v): PropertyViewRow => ({
      property_id: v.property_id,
      properties: v.properties as TPropertyResponseSchema,
    })
  );

  // Contar views por imóvel
  const viewCounts: Record<string, number> = {};
  typedViews.forEach((v) => {
    viewCounts[v.property_id] = (viewCounts[v.property_id] || 0) + 1;
  });

  // Montar lista final
  const propertiesMap: Record<
    string,
    TPropertyResponseSchema & { total_views: number }
  > = {};
  typedViews.forEach((v) => {
    const p = v.properties;
    if (!propertiesMap[p.id]) {
      propertiesMap[p.id] = {
        ...p,
        total_views: viewCounts[p.id] || 0,
      };
    }
  });

  const properties = Object.values(propertiesMap);

  // Soma total de todas as visualizações
  const total_views_all = properties.reduce(
    (acc, prop) => acc + prop.total_views,
    0
  );

  return { properties, total_views_all };
}

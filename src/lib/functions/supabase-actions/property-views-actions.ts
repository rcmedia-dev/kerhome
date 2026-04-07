'use server';

import { supabase } from "@/lib/supabase";
import { TPropertyResponseSchema } from "@/lib/types/property";

// --- INCREMENT VIEWS ---
export async function incrementPropertyViews(propertyId: string, userId: string, ownerId: string) {
  const { data, error } = await supabase
    .rpc('increment_property_views', {
      p_property_id: propertyId,
      p_user_id: userId,
      p_owner_id: ownerId,
    });

  if (error) {
    console.error('Error incrementing views:', error);
    return 0;
  }
  return data;
}

// --- GET MOST SEEN PROPERTIES ---
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

  const typedViews = (views as any[]).map(
    (v): PropertyViewRow => ({
      property_id: v.property_id,
      properties: v.properties as TPropertyResponseSchema,
    })
  );

  const viewCounts: Record<string, number> = {};
  typedViews.forEach((v) => {
    viewCounts[v.property_id] = (viewCounts[v.property_id] || 0) + 1;
  });

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

  const total_views_all = properties.reduce(
    (acc, prop) => acc + prop.total_views,
    0
  );

  return { properties, total_views_all };
}

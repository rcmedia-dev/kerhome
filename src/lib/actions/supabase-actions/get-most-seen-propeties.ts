import { supabase } from "@/lib/supabase";
import { TPropertyResponseSchema } from "@/lib/types/property";

type PropertyViewRow = {
  property_id: string;
  properties: TPropertyResponseSchema;
};

export async function getMyPropertiesWithViews(
  ownerId?: string
): Promise<(TPropertyResponseSchema & { total_views: number })[]> {
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
    return [];
  }

  // aqui o Supabase retorna "any" → vamos tratar como 1:1
  const typedViews = (views as any[]).map(
    (v): PropertyViewRow => ({
      property_id: v.property_id,
      properties: v.properties as TPropertyResponseSchema,
    })
  );

  // contar views
  const viewCounts: Record<string, number> = {};
  typedViews.forEach((v) => {
    viewCounts[v.property_id] = (viewCounts[v.property_id] || 0) + 1;
  });

  // montar lista final
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

  return Object.values(propertiesMap);
}

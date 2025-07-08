'use server';

import { supabaseServer } from "../supabase-server";
import { Property } from "../types/property";

// Buscar lista de imóveis do Supabase
export async function getProperties(limit: number = 50): Promise<Property[]> {
  const { data, error } = await supabaseServer
    .from("properties")
    .select("*")
    .limit(limit);
  if (error) throw new Error(error.message);
  return data as Property[];
}

// Buscar imóvel por ID do Supabase
export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabaseServer
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data as Property;
}

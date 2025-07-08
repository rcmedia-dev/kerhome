// src/lib/supabase-auth.ts

import { getSupabaseClient } from './supabase';

export async function signUp({ email, password }: { email: string; password: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export function getSession() {
  const supabase = getSupabaseClient();
  return supabase.auth.getSession();
}


export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}


// Removido código duplicado/corrompido

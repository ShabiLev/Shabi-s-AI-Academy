import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readAuthConfig } from "./authConfig";
let client: SupabaseClient | null = null;
export function getAuthClient(): SupabaseClient | null {
  const state = readAuthConfig(); if (!state.configured || !state.config) return null;
  client ??= createClient(state.config.url, state.config.anonKey, { auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}
export function resetAuthClientForTests() { client = null; }

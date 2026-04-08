import { createClient } from "@supabase/supabase-js";
import type { CroAudit } from "../types/audit";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAudit(id: string): Promise<CroAudit | null> {
  const { data, error } = await supabase
    .from("cro_audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as CroAudit;
}

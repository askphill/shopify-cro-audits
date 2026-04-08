import type { CroAudit } from "../types/audit";

export async function fetchAudit(id: string): Promise<CroAudit | null> {
  const res = await fetch(`/api/audit/${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  return res.json() as Promise<CroAudit>;
}

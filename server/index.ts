import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { fetchAudit } from "./notion.js";
import type { CroAudit } from "../src/types/audit.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000", 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

// In-memory cache with 5-minute TTL
const cache = new Map<string, { data: CroAudit; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(id: string): CroAudit | null {
  const entry = cache.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(id);
    return null;
  }
  return entry.data;
}

// API route
app.get("/api/audit/:id", async (req, res) => {
  const { id } = req.params;

  const cached = getCached(id);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const audit = await fetchAudit(id);
    if (!audit) {
      res.status(404).json({ error: "Audit not found" });
      return;
    }
    cache.set(id, { data: audit, expires: Date.now() + CACHE_TTL_MS });
    res.json(audit);
  } catch (err) {
    console.error("Notion API error:", err);
    res.status(502).json({ error: "Failed to fetch audit" });
  }
});

// Serve static SPA files
app.use(express.static(distPath));

// SPA fallback
app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

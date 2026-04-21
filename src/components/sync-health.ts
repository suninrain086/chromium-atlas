// src/components/sync-health.ts — F5: header indicator for last-synced-at.
// Renders only if /sync-meta.json fetched OK and lastSyncedAt < 24h ago.

interface SyncMeta {
  lastSyncedAt: string;
  sourceRef: string;
  sha: string;
  docCount: number;
  syncDurationMs: number;
}

function relTime(ageMs: number): string {
  const m = Math.floor(ageMs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export async function mountSyncHealth(host: HTMLElement): Promise<void> {
  host.hidden = true;
  try {
    const r = await fetch("./sync-meta.json", { cache: "no-store" });
    if (!r.ok) return;
    const meta = (await r.json()) as Partial<SyncMeta>;
    if (!meta || typeof meta.lastSyncedAt !== "string") return;
    const t = Date.parse(meta.lastSyncedAt);
    if (!Number.isFinite(t)) return;
    const ageMs = Date.now() - t;
    if (ageMs < 0 || ageMs > 24 * 3600 * 1000) return;
    const sha = typeof meta.sha === "string" ? meta.sha.slice(0, 8) : "?";
    host.hidden = false;
    host.title = `Last synced ${new Date(t).toLocaleString()} — sha ${sha} — ${meta.docCount ?? "?"} docs`;
    host.textContent = `Synced ${relTime(ageMs)}`;
    host.setAttribute("data-sync-fresh", "true");
  } catch {
    // network/parse error → keep hidden, no UI noise
  }
}

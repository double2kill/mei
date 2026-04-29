const STORAGE_KEY = "mei:poison-history";

export type PoisonRecord = {
  id: string;
  name: string;
  at: string;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseRecords(raw: unknown): PoisonRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: PoisonRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" && o.id ? o.id : newId();
    const name = typeof o.name === "string" ? o.name : "";
    const at = typeof o.at === "string" ? o.at : "";
    if (!name || !at) continue;
    out.push({ id, name, at });
  }
  return out;
}

export function getPoisonHistory(): PoisonRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = parseRecords(JSON.parse(raw) as unknown);
    return list.sort((a, b) => b.at.localeCompare(a.at));
  } catch {
    return [];
  }
}

export function appendPoisonRecord(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || typeof window === "undefined") return false;
  const prev = getPoisonHistory();
  const next = [
    { id: newId(), name: trimmed, at: new Date().toISOString() },
    ...prev,
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return true;
}

export function formatPoisonTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

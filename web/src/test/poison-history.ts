const STORAGE_KEY = "mei:poison-history";

export type PoisonClickStep = {
  name: string;
  isMine: boolean;
};

export type PoisonRecordDetail = {
  clicks: PoisonClickStep[];
  hitNames: string[];
  taunt: string;
};

export type PoisonRecord = {
  id: string;
  name: string;
  at: string;
  clicks: PoisonClickStep[];
  hitNames: string[];
  taunt: string;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseClickSteps(raw: unknown): PoisonClickStep[] {
  if (!Array.isArray(raw)) return [];
  const out: PoisonClickStep[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) continue;
    out.push({ name, isMine: Boolean(o.isMine) });
  }
  return out;
}

function parseHitNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const name = item.trim();
    if (name) out.push(name);
  }
  return out;
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
    out.push({
      id,
      name,
      at,
      clicks: parseClickSteps(o.clicks),
      hitNames: parseHitNames(o.hitNames),
      taunt: typeof o.taunt === "string" ? o.taunt : "",
    });
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

export function appendPoisonRecord(
  name: string,
  detail?: PoisonRecordDetail,
): boolean {
  const trimmed = name.trim();
  if (!trimmed || typeof window === "undefined") return false;
  const prev = getPoisonHistory();
  const next = [
    {
      id: newId(),
      name: trimmed,
      at: new Date().toISOString(),
      clicks: detail?.clicks ?? [],
      hitNames: detail?.hitNames ?? [],
      taunt: detail?.taunt?.trim() ?? "",
    },
    ...prev,
  ];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return true;
}

export function removePoisonRecord(id: string): boolean {
  const key = id.trim();
  if (!key || typeof window === "undefined") return false;
  const prev = getPoisonHistory();
  const next = prev.filter((row) => row.id !== key);
  if (next.length === prev.length) return false;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return true;
}

export function getKnownVictimNames(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of getPoisonHistory()) {
    const name = row.name.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
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

export function formatPoisonClickPath(clicks: PoisonClickStep[]): string {
  if (clicks.length === 0) return "";
  return clicks
    .map((step) => (step.isMine ? `${step.name}（毒）` : step.name))
    .join(" → ");
}

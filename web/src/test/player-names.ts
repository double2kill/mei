const STORAGE_KEY = "mei:player-names";
const ORDER_MIGRATED_KEY = "mei:player-names-append-order";

function parseNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const name = item.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

export function getPlayerNames(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const names = parseNames(JSON.parse(raw) as unknown);
    if (window.localStorage.getItem(ORDER_MIGRATED_KEY)) return names;
    const migrated = [...names].reverse();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    window.localStorage.setItem(ORDER_MIGRATED_KEY, "1");
    return migrated;
  } catch {
    return [];
  }
}

function savePlayerNames(names: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
}

export function addPlayerName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || typeof window === "undefined") return false;
  const prev = getPlayerNames();
  if (prev.includes(trimmed)) return false;
  window.localStorage.setItem(ORDER_MIGRATED_KEY, "1");
  savePlayerNames([...prev, trimmed]);
  return true;
}

export function removePlayerName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || typeof window === "undefined") return false;
  const prev = getPlayerNames();
  const next = prev.filter((n) => n !== trimmed);
  if (next.length === prev.length) return false;
  savePlayerNames(next);
  return true;
}

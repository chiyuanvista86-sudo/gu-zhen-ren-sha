import type { Game } from "./engine";
const KEY = "gu-zhen-ren-sha:v1:";
export function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(KEY + key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export function write(key: string, value: unknown) {
  try {
    localStorage.setItem(KEY + key, JSON.stringify(value));
  } catch {
    /* Storage can be unavailable in private or file browsing. */
  }
}
export function savedGame(): Game | null {
  const s = read<Game | null>("game", null);
  if (
    !s ||
    s.version !== 1 ||
    !Array.isArray(s.players) ||
    s.players.length !== 5 ||
    !Array.isArray(s.deck) ||
    !Array.isArray(s.discard) ||
    !s.players.every((p) => Array.isArray(p.hand) && p.id >= 0 && p.id < 5)
  )
    return null;
  return s;
}

import type { BuilderState } from './builder';
const KEY = 'festivelink-design';
const FAVORITES = 'festivelink-favorites';
export function saveDesign(state: BuilderState): string { const id = state.savedId ?? `FL-INV-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; localStorage.setItem(KEY, JSON.stringify({ ...state, savedId: id })); return id; }
export function restoreDesign(): BuilderState | null { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as BuilderState : null; }
export function getFavorites(): string[] { const raw = localStorage.getItem(FAVORITES); return raw ? JSON.parse(raw) as string[] : []; }
export function toggleFavorite(id: string): string[] { const next = getFavorites().includes(id) ? getFavorites().filter((item) => item !== id) : [...getFavorites(), id]; localStorage.setItem(FAVORITES, JSON.stringify(next)); return next; }

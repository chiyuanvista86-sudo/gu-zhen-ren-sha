import type { HeroId } from './cultivationData';
import type { HandKind } from './handData';

// User-supplied visual reference; provenance and motif mappings: ART_SOURCES.md.
const images = import.meta.glob<string>('./assets/gujiesha/*.webp', {
  eager: true, import: 'default', query: '?inline',
});
const image = (name: string) => images[`./assets/gujiesha/${name}.webp`];
export const heroArt = (id: HeroId) => image(`hero-${id === 'he Loulan' ? 'he-loulan' : id}`);
export const battlefieldArt = image('battle-arena');
export const lobbyArt = image('home-hero');
const componentMotifs: Record<string, number> = {
  'fy-core': 75, 'fy-repair': 66, 'bn-core': 49, 'bn-guard': 7,
  'hl-core': 74, 'hl-bone': 61, 'tb-core': 38, 'tb-life': 57,
  moon: 1, armor: 6, grass: 57, stride: 59, wine: 2, repair: 56,
  fang: 68, shell: 8, wing: 58, refinery: 32,
};
const handMotifs: Record<HandKind, number> = {
  life: 22, relic: 31, heaven: 29, mind: 21, soul: 39, book: 18, memory: 3, window: 20,
};
export function HeroArtwork({ id, className = '' }: { id: HeroId; className?: string }) {
  return <img className={`portrait ${className}`} src={heroArt(id)} alt="" decoding="async" draggable={false} />;
}
export function GuArtwork({ id, hand, className = '' }: { id?: string; hand?: HandKind; className?: string }) {
  const motif = hand ? handMotifs[hand] : componentMotifs[id ?? 'moon'] ?? 1;
  return <img className={`c-gu-image ${hand ? `illustration-${hand}` : ''} ${className}`} src={image(`gu-${motif}`)} alt="" decoding="async" draggable={false} />;
}

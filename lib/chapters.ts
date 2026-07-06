/**
 * Single source of truth for the book "Chor Sinfonie".
 *
 * Drives: the home card grid, the /chor/[slug] routes, the Books menu,
 * and which Three.js scene renders for each chapter.
 *
 * `sceneId` maps into components/three/scenes/index.ts.
 * `accent` is the per-chapter color used for card hover borders and the drop cap.
 * `hasBackground` is false only for Borboletas (plain page, no background scene).
 */

export type SceneId =
  | "agua"
  | "perfeito"
  | "seco"
  | "maos"
  | "triangulo"
  | "construcao"
  | "denso"
  | "borboletas";

export type Chapter = {
  slug: string;
  num: number;
  /** Japanese kanji numeral shown large on the card back. */
  kanji: string;
  title: string;
  /** Filename inside content/chor/. */
  file: string;
  sceneId: SceneId;
  hasBackground: boolean;
  /** Accent color (scene palette) for hover borders / drop cap. */
  accent: string;
};

export const CHAPTERS: Chapter[] = [
  { slug: "agua", num: 1, kanji: "一", title: "Água", file: "agua.md", sceneId: "agua", hasBackground: true, accent: "#4aa3c7" },
  { slug: "perfeito", num: 2, kanji: "二", title: "Perfeito", file: "perfeito.md", sceneId: "perfeito", hasBackground: true, accent: "#8f8fa8" },
  { slug: "seco", num: 3, kanji: "三", title: "Seco", file: "seco.md", sceneId: "seco", hasBackground: true, accent: "#8a1f1f" },
  { slug: "maos", num: 4, kanji: "四", title: "Mãos", file: "maos.md", sceneId: "maos", hasBackground: true, accent: "#3f6fb0" },
  { slug: "triangulo", num: 5, kanji: "五", title: "Triângulo", file: "triangulo.md", sceneId: "triangulo", hasBackground: true, accent: "#d8b13a" },
  { slug: "construcao", num: 6, kanji: "六", title: "Construção", file: "construcao.md", sceneId: "construcao", hasBackground: true, accent: "#b8934a" },
  { slug: "denso", num: 7, kanji: "七", title: "Denso", file: "denso.md", sceneId: "denso", hasBackground: true, accent: "#5f7a55" },
  { slug: "borboletas", num: 8, kanji: "八", title: "Borboletas", file: "borboletas.md", sceneId: "borboletas", hasBackground: false, accent: "#3f7a63" },
];

export const CHAPTERS_BY_SLUG: Record<string, Chapter> = Object.fromEntries(
  CHAPTERS.map((c) => [c.slug, c]),
);

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS_BY_SLUG[slug];
}

/** Chapter before/after the given one, for prev/next navigation. */
export function getAdjacent(slug: string): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return { prev: CHAPTERS[i - 1], next: CHAPTERS[i + 1] };
}

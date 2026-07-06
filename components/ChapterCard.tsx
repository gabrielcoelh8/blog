"use client";

import Link from "next/link";
import type { Chapter } from "@/lib/chapters";
import SceneFrame from "@/components/three/SceneFrame";
import styles from "./ChapterCard.module.css";

/**
 * Square Are.na-style card. Front shows the chapter's animated cover (Three.js);
 * on hover/focus it flips (CSS 3D rotateY) to reveal the large kanji numeral and
 * the chapter title. The whole card links to the chapter page.
 */
export default function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <Link
      href={`/chor/${chapter.slug}`}
      className={styles.card}
      style={{ ["--accent" as string]: chapter.accent }}
      aria-label={`Capítulo ${chapter.num}: ${chapter.title}`}
    >
      <div className={styles.flipper}>
        <div className={styles.front}>
          <SceneFrame sceneId={chapter.sceneId} mode="cover" />
        </div>
        <div className={styles.back}>
          <span className={styles.kanji}>{chapter.kanji}</span>
          <span className={styles.title}>{chapter.title}</span>
          <span className={styles.num}>capítulo {chapter.num}</span>
        </div>
      </div>
    </Link>
  );
}

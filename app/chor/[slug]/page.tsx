import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CHAPTERS, getChapter, getAdjacent } from "@/lib/chapters";
import { getChapterHtml } from "@/lib/markdown";
import SceneFrame from "@/components/three/SceneFrame";
import LiquidTitle from "@/components/LiquidTitle";
import styles from "./chapter.module.css";

// Pre-render one static page per chapter (prefácio has its own route).
export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return {};
  return {
    title: `${chapter.title} — Chor Sinfonie`,
    description: `Capítulo ${chapter.num} de Chor Sinfonie.`,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { html } = await getChapterHtml(chapter.file);
  const { prev, next } = getAdjacent(slug);

  return (
    <div className={styles.page}>
      {/* Fixed background scene (skipped for Borboletas). */}
      {chapter.hasBackground && (
        <div className={styles.bg} aria-hidden="true">
          <SceneFrame sceneId={chapter.sceneId} mode="background" />
        </div>
      )}

      {/* Top banner rectangle. */}
      <div className={styles.banner} aria-hidden="true">
        <SceneFrame sceneId={chapter.sceneId} mode="banner" />
      </div>

      <article
        className={`${styles.article} ${chapter.hasBackground ? styles.glass : styles.plain}`}
        style={{ ["--dropcap" as string]: chapter.accent }}
      >
        <p className={styles.kicker}>
          <span className={styles.kanji}>{chapter.kanji}</span> capítulo{" "}
          {chapter.num}
        </p>

        {chapter.slug === "agua" ? (
          <LiquidTitle>{chapter.title}</LiquidTitle>
        ) : (
          <h1 className={styles.title}>{chapter.title}</h1>
        )}

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <nav className={styles.pager}>
          {prev ? (
            <Link href={`/chor/${prev.slug}`} className={styles.pagerLink}>
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/chor/${next.slug}`} className={styles.pagerLink}>
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}

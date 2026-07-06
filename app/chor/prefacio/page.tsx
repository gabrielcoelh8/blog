import type { Metadata } from "next";
import { getChapterHtml } from "@/lib/markdown";
import styles from "./prefacio.module.css";

export const metadata: Metadata = {
  title: "Prefácio — Chor Sinfonie",
  description: "Prefácio de Chor Sinfonie.",
};

// Simple page, no Three.js scene (per plan).
export default async function PrefacioPage() {
  const { title, html } = await getChapterHtml("prefacio.md");

  return (
    <article className={styles.article}>
      <h1 className={styles.title}>{title || "Prefácio"}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}

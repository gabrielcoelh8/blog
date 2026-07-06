import Link from "next/link";
import { CHAPTERS } from "@/lib/chapters";
import ChapterCard from "@/components/ChapterCard";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.wrap}>
      <header className={styles.intro}>
        <h1 className={styles.book}>Chor Sinfonie</h1>
        <p className={styles.sub}>
          uma sinfonia em oito movimentos —{" "}
          <Link href="/chor/prefacio" className={styles.prefLink}>
            prefácio
          </Link>
        </p>
      </header>

      <section className={styles.grid} aria-label="Capítulos">
        {CHAPTERS.map((chapter) => (
          <ChapterCard key={chapter.slug} chapter={chapter} />
        ))}
      </section>
    </div>
  );
}

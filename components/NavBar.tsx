"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/lib/chapters";
import { APOIE_URL, SITE_TITLE } from "@/lib/constants";
import styles from "./NavBar.module.css";

/**
 * Are.na-style header: plain text, no boxes, no animation.
 * "Chor Sinfonie / Início · Books · Apoie" — active item white, others muted.
 * Books opens a simple bordered dropdown listing Prefácio + the 8 chapters.
 */
export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const booksRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (booksRef.current && !booksRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isHome = pathname === "/";
  const inBooks = pathname.startsWith("/chor");

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}>
          {SITE_TITLE}
        </Link>
        <span className={styles.sep}>/</span>

        <Link
          href="/"
          className={isHome ? styles.active : styles.item}
        >
          Início
        </Link>
        <span className={styles.dot}>·</span>

        <div className={styles.booksWrap} ref={booksRef}>
          <button
            type="button"
            className={inBooks ? styles.active : styles.item}
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            Books
          </button>
          {open && (
            <ul className={styles.dropdown}>
              <li>
                <Link href="/chor/prefacio" onClick={() => setOpen(false)}>
                  Prefácio
                </Link>
              </li>
              {CHAPTERS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/chor/${c.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    {c.num}. {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className={styles.dot}>·</span>

        <a
          href={APOIE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.item}
        >
          Apoie
        </a>
      </nav>
    </header>
  );
}

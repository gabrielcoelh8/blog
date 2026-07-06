import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { remark } from "remark";
import html from "remark-html";

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Strip the leading "# Title" line — the title is rendered separately in the page
 * header (so the drop cap applies to the first body paragraph, and Água can use the
 * animated LiquidTitle). Returns the title text and the remaining markdown. */
function splitTitle(raw: string): { title: string; body: string } {
  const lines = raw.split("\n");
  let title = "";
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;
    const m = line.match(/^#\s+(.*)$/);
    if (m) {
      title = m[1].trim();
      start = i + 1;
    }
    break;
  }
  return { title, body: lines.slice(start).join("\n") };
}

async function renderMarkdown(md: string): Promise<string> {
  const file = await remark().use(html).process(md);
  return String(file);
}

/** Read a chapter file from content/chor/, returning its title and rendered HTML body. */
export async function getChapterHtml(
  file: string,
): Promise<{ title: string; html: string }> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, "chor", file), "utf8");
  const { title, body } = splitTitle(raw);
  return { title, html: await renderMarkdown(body) };
}

/** Read a top-level content page (e.g. sobre.md), keeping its heading in the body. */
export async function getPageHtml(
  file: string,
): Promise<{ title: string; html: string }> {
  const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
  const { title, body } = splitTitle(raw);
  return { title, html: await renderMarkdown(body) };
}

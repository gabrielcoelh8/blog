import type { Metadata } from "next";
import { UnifrakturMaguntia, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { SITE_TITLE } from "@/lib/constants";

// Blackletter drop-cap font (classic-book initial letter).
const fraktur = UnifrakturMaguntia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fraktur",
  display: "swap",
});

// Kanji numerals for card backs (一〜八). preload:false so the CJK face is only
// fetched when a card back is shown, not blocking initial paint.
const notoSerifJp = Noto_Serif_JP({
  weight: "600",
  variable: "--font-kanji",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: "Contos de Gabriel Coelho — uma sinfonia em oito movimentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraktur.variable} ${notoSerifJp.variable}`}
    >
      <body>
        <NavBar />
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}

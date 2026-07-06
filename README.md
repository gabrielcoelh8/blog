# Chor Sinfonie

Site literário para o livro **Chor Sinfonie** — oito contos, cada um com uma cena
animada em Three.js. Construído com Next.js 16 (App Router + Turbopack), exportado
como site estático para o Cloudflare Pages.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # gera o site estático em out/
```

## Estrutura

- `content/` — os textos em Markdown (fonte editável). `content/chor/*.md` são os
  capítulos; `content/sobre.md` é a página inicial "Sobre".
- `lib/chapters.ts` — registro único dos capítulos (slug, número, kanji, título,
  cena, cor de acento). Edite aqui para mudar ordem, títulos ou cores.
- `lib/markdown.ts` — pipeline que lê o Markdown e gera HTML (remark).
- `lib/constants.ts` — `APOIE_URL` (troque pelo link de apoio real).
- `components/three/` — sistema de cenas. `SceneFrame.tsx` é o único lugar que cria
  um `<Canvas>`; cada `scenes/*.tsx` exporta `Main` (capa/banner) e opcionalmente
  `Background`. As cenas são fragment shaders (veja `shaders/noise.ts`).

## Deploy (Cloudflare Pages)

O Cloudflare Pages builda e publica a cada push na `main`. Configuração em
_Settings → Build_:

- **Framework preset:** Next.js (Static HTML Export) — _não_ o preset "Next.js"
  normal, que roda o adapter OpenNext desnecessariamente.
- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Build cache:** ativado (acelera o `npm ci` entre deploys).
- **Variável de ambiente:** `NODE_VERSION=22`

O site é servido na raiz do domínio, então não há `basePath`.

## Notas

- Fonte do corpo: Times New Roman (sistema). Capitular: UnifrakturMaguntia. Kanji
  dos cards: Noto Serif JP.
- As animações pausam quando saem da tela (IntersectionObserver) e respeitam
  `prefers-reduced-motion`.

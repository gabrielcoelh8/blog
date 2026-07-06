# Chor Sinfonie

Site literário para o livro **Chor Sinfonie** — oito contos, cada um com uma cena
animada em Three.js. Construído com Next.js 16 (App Router + Turbopack), exportado
como site estático para o GitHub Pages.

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

## Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` faz `npm ci && npm run build` e publica
`out/` via GitHub Actions a cada push na `main`.

**Passo manual, uma vez:** em _Settings → Pages → Build and deployment → Source_,
selecione **GitHub Actions**.

O site é servido em `https://gabrielcoelh8.github.io/blog/` — por isso o
`basePath: '/blog'` em produção (`next.config.ts`). Em `next dev` o basePath é
vazio, então tudo roda em `/`.

## Notas

- Fonte do corpo: Times New Roman (sistema). Capitular: UnifrakturMaguntia. Kanji
  dos cards: Noto Serif JP.
- As animações pausam quando saem da tela (IntersectionObserver) e respeitam
  `prefers-reduced-motion`.

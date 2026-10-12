# Kercasa Demo 90s — apresentação + vídeo Hyperframes

## 1. Abrir a demo interativa (sem instalar nada)

```powershell
# opção A — ficheiro direto
start kercasa-demo\index.html
# opção B — servir (recomendado p/ fontes/imagens)
npx serve kerhome -l 3001
# abrir http://localhost:3001/kercasa-demo/index.html
```

Palco **1920×1080** com auto-escala. Controlos: **Play 90s** (tempos reais 6/12/17/15/20/20),
navegação por cena, barra de progresso + dots 1–6. Zero emojis — 65 ícones
**Lucide** (`lucide@0.522.0`, a mesma biblioteca do produto via `lucide-react`).

## 2. O que foi adaptado do roteiro genérico → Kercasa real

- **Cores:** descartado azul `#0A2540`; aplicado roxo real `#6D28D9` + gradiente
  `#7E22CE→#6D28D9→#F97316` (extraído de `sobre/page.tsx`, `globals.css`, `themeColor #6d35d4`),
  CTA em roxo-noite `#2E1065`, selo verificado esmeralda `#10B981`.
- **Tipo:** Inter 400–900 (igual ao produto em `globals.css`), PT-AO.
- **Negócio:** Comprar/Arrendar/Vender em Angola; 5000+ imóveis, 15 províncias,
  Talatona/Kilamba/Viana/Benguela/Huíla; preços em Kz; agentes verificados, chat <1min,
  Tour 360° (Panolens/A-Frame já no `package.json`), agendamento, Shield/docs/pagamento, 98% satisfação.

## 3. Vídeo MP4 — já renderizado

```powershell
start kercasa-demo\renders\kercasa-90s.mp4
```

- **12,7 MB · 90,0s · 1920×1080 · 30fps · H.264 + AAC estéreo.**
- Trilha `video/assets/mix.mp3` (90s, 192k): fundo `background-audio.mp3`
  (108s → cortado 0–90s, fade-in 1,5s, fade-out 87–90s, normalizado −18 LUFS)
  casado ao vídeo + 8 SFX nas cenas: chime 6s, pop 18s, whoosh 35s,
  riser 48s + impacto 50s (clímax), chime duplo 70s, outro 87s.
- Re-renderizar: `npx hyperframes render kercasa-demo/video --output kercasa-demo/renders/kercasa-90s.mp4`
- Verificar: `npx hyperframes lint kercasa-demo/video` (0 erros) e
  `npx hyperframes snapshot kercasa-demo/video --at 3,12,26,42,60,80`.

## 4. Ficheiros

- `index.html` — demo interativa (secções com `data-start`/`data-duration`/
  `data-composition-id="kercasa-90s"` como referência visual).
- `hyperframes.prompt.md` — roteiro comprimido executável + tabela de transições.
- `video/` — projeto Hyperframes: `index.html` (composição 90s, timeline GSAP pausada),
  `assets/` (logo, house1/3/5, `mix.mp3`), `hyperframes.json`, `meta.json`, `package.json`.
- `video/snapshots/` — frames de verificação + `contact-sheet.jpg`.
- `renders/kercasa-90s.mp4` — vídeo final.

# Kercasa — Prompt Hyperframes (copiar-colar no agent)

> Pré-requisito: `npx skills add heygen-com/hyperframes` → escolher **Core Skills** → reiniciar o agent (Claude Code / Cursor / Codex). Ambiente: Node 22+ e FFmpeg (já OK neste projeto: Node 26, FFmpeg 8.1).

```
Use /hyperframes para criar um vídeo com base no seguinte roteiro:

Marca: Kercasa — marketplace imobiliário de Angola (Comprar · Arrendar · Vender)
Tagline: "Kercasa. A sua casa, mais perto."
Duração: 90 segundos, 1920×1080, 30fps, idioma PT-AO
Estilo: Apple + Zillow — limpo, minimalista, movimento fluido, orientado a emoção e confiança

PALETA REAL KERCASA (não usar azul #0A2540):
- Primário roxo profundo #6D28D9 (títulos, pins, CTAs secundários)
- Gradiente assinatura: #7E22CE → #6D28D9 → #F97316 (logo, headlines, números)
- Acento laranja #F97316 / #EA580C (CTA principal, badges "Novo")
- Fundo #FAFAF8 branco quente + #FFFFFF cards; CTA final em roxo noite #2E1065 → #6D28D9
- Verificado esmeralda #10B981 (apenas selos "✓ Verificado", checkmarks)
- Âmbar #F5A623 apenas para timer/estrelas/ênfase emocional
- Texto: #111827 títulos, #4B5563 corpo, #6B7280 muted

TIPOGRAFIA: Inter (idêntica ao produto: globals.css usa Inter + SF Pro + Geist Sans).
Títulos Inter 800/900 tracking -0.04em; corpo Inter 400/500 32–36px @1080p. Nada de serifas.

MÚSICA/SFX (mix.mp3, 90s estéreo): fundo = kercasa-demo/background-audio.mp3
(108s → trim 0–90s, fade-in 1.5s, fade-out 87–90s, loudnorm −18 LUFS) + 8 SFX
sincronizados (chime 6s, pop 18s, whoosh 35s, riser 48s + impacto 50s, chime duplo 70s, outro 87s).

ÍCONES: apenas Lucide (lucide@0.522.0 — mesma biblioteca do produto). Zero emojis em tela.

CORE BUSINESS (mostrar de verdade, sem inventar):
- Catálogo: 5000+ imóveis, 15 províncias, foco Talatona/Kilamba/Viana (Luanda), Benguela, Huíla
- Jornada: busca typewriter → filtros (local, tipologia T2/T3/T4, preço Kz, verificados, com Tour VR) → cards stagger → zoom mapa → tour 360° (Panolens) → calendário → checkmark
- Confiança: agentes/agências verificadas 4.9★, chat tempo real <1min, contrato digital, Kercasa Shield (titularidade + caução protegida), suporte 24/7 PT-AO
- Prova: 98% satisfação; depoimentos Maria S. (Luanda), João P. (Benguela), Ana C. (investidora)

ESTRUTURA DE CENAS (tempos rígidos, soma 90s):
1. 0–6s LOGO: fundo branco → stroke SVG casa roxa (strokeDashoffset, power2.inOut 1.6s) → "ker" roxo + "casa" gradiente letra-a-letra (power3.out stagger .35) → tagline → fade-to-white
2. 6–18s EMOÇÃO+MAPA: match-cut mão/parede → mapa Angola, pins verdes caindo stagger → 1 pin expande (back.out) em card "Talatona T4 85.000.000 Kz ✓ Verificado" + 2 cards (Kilamba T3, Benguela arrendamento)
3. 18–35s PRODUTO: split phone+desktop → typewriter "T3 em Talatona até 40M…" → filtros expandem → resultados stagger (128 verificados) → zoom-through mapa → etiqueta Tour 360° → calendário "Seg 10:30 ✓" com pop elástico
4. 35–50s CONFIANÇA: morph checkmark→chave (SVG attr) → whip-pan para agente+família → bubbles chat tempo real → assinatura digital → 3 selos Shield/docs/pagamento (pop back.out stagger)
5. 50–70s CLÍMAX: casa noturna porta abre (blur-reveal) → jantar família órbita lenta → contadores roll-up 5000+/15/98%/24-7 (power2.out) → partículas formam "O seu próximo lar está aqui" (registry particle-dissolve)
6. 70–90s CTA: fundo #2E1065→#6D28D9 → logo branco → typewriter kercasa.com + "Comprar · Arrendar · Vender" → botões pop (Pesquisar / Falar com agente / App Store+Play) → QR code scale-in → "Kercasa. A sua casa, mais perto." → fade-to-black 1s

TRANSIÇÕES/EASES: fade-to-white, match-cut, zoom-through, morph, whip-pan, particle-dissolve, blur-reveal. Eases: power2.inOut (master), power3.out (entradas), back.out(1.4) (pops), power2.out (contadores). immediateRender:false em clips sobrepostos.

ASSETS (usar do repo, não placeholders genéricos):
- logo: ../public/kercasa_logo.png | fotos: ../public/house1.jpg, house3.jpg, house5.jpg (+house8/10/12 p/ B-roll)
- QR/App icons: gerar placeholder com label e substituir antes do render final
- Instalação opcional registry: npx hyperframes add flash-through-white particle-dissolve shimmer-sweep

VERIFICAÇÃO: npx hyperframes lint → npx hyperframes check → npx hyperframes snapshot --at 0,6,18,35,50,70 → npx hyperframes render --output kercasa-90s.mp4
```

## Mapeamento transição → Hyperframes

| Roteiro | Implementação |
|---|---|
| fade-to-white | `fromTo` opacity+backgroundColor ou bloco `flash-through-white` |
| match-cut casa→mapa | 2 clips sobrepostos, `immediateRender:false` |
| morph ✓→chave | SVG `strokeDashoffset` + `attr:d` |
| whip-pan | `x` rápido + `filter:blur` |
| particle-dissolve | bloco registry / TypeGPU |
| blur-reveal CTA | keyframes `filter:blur()+opacity` |
| contadores | `snap` + `power2.out` |
| typewriter | plugin TextPlugin ou JS slice, 35ms/char |

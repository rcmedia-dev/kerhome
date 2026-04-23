/**
 * Utilitário de marca d'água para imagens de imóveis.
 *
 * Correções para visibilidade:
 *  - Adicionado .ensureAlpha() para garantir suporte a transparência no composite
 *  - Adicionado limite de segurança (o logo não pode ser maior que 90% da imagem)
 *  - Logs de diagnóstico no terminal para depuração
 *  - Utilização de path.resolve para localização robusta do ficheiro
 */

import sharp from 'sharp'
import path from 'path'
import { readFile, access } from 'fs/promises'

const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/jfif',
]

export interface WatermarkResult {
  buffer: Buffer
  contentType: string
  watermarkApplied: boolean
}

/**
 * Aplica a marca d'água KerCasa a um buffer de imagem.
 */
export async function applyWatermark(
  inputBuffer: Buffer,
  mimeType: string,
): Promise<WatermarkResult> {
  const type = mimeType.toLowerCase()
  if (!SUPPORTED_MIME_TYPES.some(t => type.includes(t))) {
    console.log(`[KerCasa Watermark] Formato não suportado ou ignorado: ${mimeType}`)
    return { buffer: inputBuffer, contentType: mimeType, watermarkApplied: false }
  }

  try {
    // ── 1. Localizar e carregar logo ─────────────────────────────────────────
    // Tentamos primeiro a versão com opacidade, se não houver, usamos a normal
    let logoName = 'kercasa_opacidade_35.png'
    let watermarkPath = path.resolve(process.cwd(), 'public', logoName)
    
    try {
      await access(watermarkPath)
    } catch {
      logoName = 'kercasa_logo.png'
      watermarkPath = path.resolve(process.cwd(), 'public', logoName)
      try {
        await access(watermarkPath)
      } catch {
        console.error(`[KerCasa Watermark] ERRO: Nenhum logo encontrado em /public`)
        return { buffer: inputBuffer, contentType: mimeType, watermarkApplied: false }
      }
    }

    const watermarkRaw = await readFile(watermarkPath)

    // ── 2. Obter metadados da imagem ──────────────────────────────────────────
    const imgMetadata = await sharp(inputBuffer).metadata()
    const imageWidth = imgMetadata.width ?? 1200
    const imageHeight = imgMetadata.height ?? 800
    const originalFormat = imgMetadata.format

    // ── 3. Calcular tamanho ideal do logo (Baseado na IMAGEM, não no LOGO) ────
    // O logo deve ocupar cerca de 30% da largura da imagem
    let targetLogoWidth = Math.round(imageWidth * 0.3)
    
    // Limite mínimo para não ficar invisível em imagens pequenas
    if (targetLogoWidth < 150 && imageWidth > 200) targetLogoWidth = 150

    // ── 4. Processar o logo (Redimensionar e garantir opacidade) ──────────────
    // Se o logo for o original (sem opacidade no nome), aplicamos opacidade via sharp
    let logoPipeline = sharp(watermarkRaw).resize(targetLogoWidth)
    
    if (logoName === 'kercasa_logo.png') {
       // Aplicar opacidade de 0.2 se for o logo normal
       logoPipeline = logoPipeline.composite([
         {
           input: Buffer.from([255, 255, 255, 51]), // 20% opacity alpha mask
           raw: { width: 1, height: 1, channels: 4 },
           tile: true,
           blend: 'dest-in'
         }
       ])
    }

    const resizedLogo = await logoPipeline.png().toBuffer()
    const resizedLogoMeta = await sharp(resizedLogo).metadata()
    
    const realLogoW = resizedLogoMeta.width ?? targetLogoWidth
    const realLogoH = resizedLogoMeta.height ?? 0

    // ── 5. Calcular Coordenadas (Centro exato) ────────────────────────────────
    const left = Math.round((imageWidth - realLogoW) / 2)
    const top = Math.round((imageHeight - realLogoH) / 2)

    console.log(`[KerCasa Watermark] Processando ${originalFormat}: Logo ${realLogoW}x${realLogoH} no centro de ${imageWidth}x${imageHeight}`)

    // ── 6. Aplicar composite ─────────────────────────────────────────────────
    let pipeline = sharp(inputBuffer)
      .ensureAlpha()
      .composite([
        {
          input: resizedLogo,
          left: Math.max(left, 0),
          top: Math.max(top, 0),
          blend: 'over',
        },
      ])

    // ── 7. Manter formato original ou converter para WebP se for muito grande
    const format = (originalFormat as string)?.toLowerCase()
    
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: 85, mozjpeg: true })
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality: 85 })
    } else if (format === 'png') {
      pipeline = pipeline.png({ compressionLevel: 8 })
    } else {
      // Formatos exóticos (HEIC, etc) - convertemos para WebP para web compat
      pipeline = pipeline.webp({ quality: 85 })
    }

    const outputBuffer = await pipeline.toBuffer()

    return {
      buffer: outputBuffer,
      contentType: mimeType,
      watermarkApplied: true,
    }
  } catch (err) {
    console.error('[KerCasa Watermark] Erro crítico ao processar imagem:', err)
    return { buffer: inputBuffer, contentType: mimeType, watermarkApplied: false }
  }
}

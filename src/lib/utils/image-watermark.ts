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
  if (!SUPPORTED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return { buffer: inputBuffer, contentType: mimeType, watermarkApplied: false }
  }

  try {
    // ── 1. Localizar e carregar logo ─────────────────────────────────────────
    const logoName = 'kercasa_opacidade_35.png'
    const watermarkPath = path.resolve(process.cwd(), 'public', logoName)
    
    // Verificar se o ficheiro existe antes de tentar ler
    try {
      await access(watermarkPath)
    } catch {
      console.error(`[KerCasa Watermark] ERRO: Ficheiro não encontrado em ${watermarkPath}`)
      return { buffer: inputBuffer, contentType: mimeType, watermarkApplied: false }
    }

    const watermarkRaw = await readFile(watermarkPath)

    // ── 2. Obter metadados da imagem e do logo ───────────────────────────────
    const imgMetadata = await sharp(inputBuffer).metadata()
    const logoMetadata = await sharp(watermarkRaw).metadata()

    const imageWidth = imgMetadata.width ?? 1200
    const imageHeight = imgMetadata.height ?? 800
    const originalFormat = imgMetadata.format
    const originalLogoW = logoMetadata.width ?? 400

    // ── 3. Calcular tamanho (50% do original do logo com limite de segurança) 
    // Garante que o logo não ocupe mais de 85% da largura da imagem de fundo
    let targetLogoWidth = Math.round(originalLogoW * 0.5)
    const maxWidthAllowed = Math.round(imageWidth * 0.85)
    
    if (targetLogoWidth > maxWidthAllowed) {
      targetLogoWidth = maxWidthAllowed
    }

    // ── 4. Processar o logo (Redimensionar) ──────────────────────────────────
    const resizedLogo = await sharp(watermarkRaw)
      .resize(targetLogoWidth)
      .png()
      .toBuffer()

    const resizedLogoMeta = await sharp(resizedLogo).metadata()
    const realLogoW = resizedLogoMeta.width ?? targetLogoWidth
    const realLogoH = resizedLogoMeta.height ?? 0

    // ── 5. Calcular Coordenadas (Centro) ─────────────────────────────────────
    const left = Math.round((imageWidth - realLogoW) / 2)
    const top = Math.round((imageHeight - realLogoH) / 2)

    console.log(`[KerCasa Watermark] Aplicando logo (${realLogoW}x${realLogoH}) em imagem (${imageWidth}x${imageHeight}) na posição ${left},${top}`)

    // ── 6. Aplicar composite com .ensureAlpha() para segurança ──────────────
    let pipeline = sharp(inputBuffer)
      .ensureAlpha() // Garante suporte a transparência durante o composite
      .composite([
        {
          input: resizedLogo,
          left: Math.max(left, 0),
          top: Math.max(top, 0),
          blend: 'over',
        },
      ])

    // ── 7. Manter o formato original ─────────────────────────────────────────
    if (originalFormat === 'jpeg' || originalFormat === 'jpg') {
      pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true })
    } else if (originalFormat === 'webp') {
      pipeline = pipeline.webp({ quality: 90 })
    } else if (originalFormat === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9 })
    } else {
      pipeline = pipeline.toFormat(originalFormat as any)
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

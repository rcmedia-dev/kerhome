
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function testWatermark() {
  const logoPath = path.resolve(process.cwd(), 'public', 'kercasa_opacidade_35.png');
  const inputPath = path.resolve(process.cwd(), 'public', 'house.jpg'); // Assuming this exists
  const outputPath = path.resolve(process.cwd(), 'scratch', 'test_output.jpg');

  try {
    if (!fs.existsSync(inputPath)) {
        console.log("No house.jpg found, creating a solid color image...");
        await sharp({
            create: {
                width: 1200,
                height: 800,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        }).jpeg().toFile(inputPath);
    }

    const inputBuffer = fs.readFileSync(inputPath);
    const watermarkRaw = fs.readFileSync(logoPath);

    const imgMetadata = await sharp(inputBuffer).metadata();
    const logoMetadata = await sharp(watermarkRaw).metadata();

    const imageWidth = imgMetadata.width ?? 1200;
    const imageHeight = imgMetadata.height ?? 800;

    let targetLogoWidth = Math.round(logoMetadata.width * 0.5);
    const maxWidthAllowed = Math.round(imageWidth * 0.85);
    
    if (targetLogoWidth > maxWidthAllowed) {
      targetLogoWidth = maxWidthAllowed;
    }

    const resizedLogo = await sharp(watermarkRaw)
      .resize(targetLogoWidth)
      .png()
      .toBuffer();

    const resizedLogoMeta = await sharp(resizedLogo).metadata();
    const realLogoW = resizedLogoMeta.width;
    const realLogoH = resizedLogoMeta.height;

    const left = Math.round((imageWidth - realLogoW) / 2);
    const top = Math.round((imageHeight - realLogoH) / 2);

    console.log(`Processing: Logo ${realLogoW}x${realLogoH} on Image ${imageWidth}x${imageHeight} at ${left},${top}`);

    const outputBuffer = await sharp(inputBuffer)
      .ensureAlpha()
      .composite([
        {
          input: resizedLogo,
          left: Math.max(left, 0),
          top: Math.max(top, 0),
          blend: 'over',
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    fs.writeFileSync(outputPath, outputBuffer);
    console.log('Success! Output saved to', outputPath);
  } catch (err) {
    console.error('Error:', err);
  }
}

testWatermark();

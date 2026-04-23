
const sharp = require('sharp');
const path = require('path');

async function test() {
  const logoPath = path.resolve(process.cwd(), 'public', 'kercasa_opacidade_35.png');
  try {
    const metadata = await sharp(logoPath).metadata();
    console.log('Logo Metadata:', metadata);
  } catch (err) {
    console.error('Error reading logo:', err);
  }
}

test();

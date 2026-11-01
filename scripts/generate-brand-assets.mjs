import sharp from 'sharp';

// Derive web-sized copies from the supplied artwork without recolouring it.
const source = 'CASA LOGO.png';
await sharp(source).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png({ compressionLevel: 9 }).toFile('public/casa-logo.png');
for (const size of [32, 180, 192, 512]) {
  await sharp(source).resize(size, size, { fit: 'contain', background: '#ffffff' }).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/></svg>`), blend: 'dest-in' }]).png({ compressionLevel: 9 }).toFile(`public/casa-icon-round-${size}.png`);
}
console.log('Generated website logo and browser/app icons from CASA LOGO.png');

const roundLogo = await sharp(source).resize(300, 300, { fit: 'contain', background: '#ffffff' }).composite([{ input: Buffer.from('<svg width="300" height="300"><circle cx="150" cy="150" r="150" fill="white"/></svg>'), blend: 'dest-in' }]).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#153ca5' } }).composite([{ input: roundLogo, left: 450, top: 165 }]).png().toFile('public/casa-social.png');

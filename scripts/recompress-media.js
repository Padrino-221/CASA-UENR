/* eslint-disable @typescript-eslint/no-require-imports */
// Recompress media already stored in the database (e.g. images uploaded before
// compression existed). Only writes back when the result is smaller.
require('dotenv').config();
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const RASTER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

async function main() {
  const assets = await db.mediaAsset.findMany();
  let recompressed = 0;
  let skipped = 0;
  let saved = 0;

  for (const asset of assets) {
    if (!asset.data || !RASTER_TYPES.includes(asset.mimeType)) {
      skipped++;
      continue;
    }

    const input = Buffer.from(asset.data);
    let output;
    try {
      output = await sharp(input)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    } catch (err) {
      console.warn(`  skip ${asset.filename}: ${err.message}`);
      skipped++;
      continue;
    }

    if (output.length < input.length) {
      await db.mediaAsset.update({
        where: { id: asset.id },
        data: { data: output, mimeType: 'image/webp', size: output.length },
      });
      saved += input.length - output.length;
      recompressed++;
      console.log(
        `  ${asset.filename}: ${(input.length / 1024).toFixed(0)}KB -> ${(output.length / 1024).toFixed(0)}KB`
      );
    } else {
      skipped++;
      console.log(`  ${asset.filename}: already optimal (${(input.length / 1024).toFixed(0)}KB)`);
    }
  }

  console.log(`\nrecompressed=${recompressed} skipped=${skipped} saved=${(saved / 1024 / 1024).toFixed(2)}MB`);
}

main()
  .then(() => db.$disconnect())
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

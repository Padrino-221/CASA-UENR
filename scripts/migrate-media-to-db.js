/* eslint-disable @typescript-eslint/no-require-imports */
// Idempotent migration: move uploaded media files that live on disk
// (public/uploads/...) into the database, then repoint every reference
// (leaders, articles, page content) at the durable /api/media/<id> URL.
require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

const OLD_URL = /\/uploads\/cms\/[A-Za-z0-9._-]+/g;

async function migrateBytes() {
  const assets = await db.mediaAsset.findMany();
  let migrated = 0;
  let missing = 0;

  for (const asset of assets) {
    if (asset.data || !asset.url.startsWith('/uploads/')) continue;
    const filePath = path.join(process.cwd(), 'public', asset.url.replace(/^\//, ''));
    try {
      const bytes = await fs.readFile(filePath);
      await db.mediaAsset.update({
        where: { id: asset.id },
        data: { data: bytes, url: `/api/media/${asset.id}` },
      });
      migrated++;
    } catch {
      missing++;
    }
  }
  console.log(`Bytes moved into DB: migrated=${migrated} missing=${missing}`);
}

async function buildSizeMap() {
  const assets = await db.mediaAsset.findMany({ where: { url: { startsWith: '/api/media/' } } });
  const map = new Map();
  for (const asset of assets) map.set(asset.size, asset.url);
  return map;
}

async function remap(text, sizeMap) {
  if (!text) return { text, changed: false };
  const matches = text.match(OLD_URL);
  if (!matches) return { text, changed: false };

  let out = text;
  let changed = false;
  for (const oldUrl of new Set(matches)) {
    try {
      const stat = await fs.stat(path.join(process.cwd(), 'public', oldUrl.replace(/^\//, '')));
      const newUrl = sizeMap.get(stat.size);
      if (newUrl) {
        out = out.split(oldUrl).join(newUrl);
        changed = true;
      }
    } catch {
      /* file missing — leave reference untouched */
    }
  }
  return { text: out, changed };
}

async function remapReferences() {
  const sizeMap = await buildSizeMap();
  let updated = 0;

  for (const leader of await db.siteLeader.findMany()) {
    const { text, changed } = await remap(leader.imageUrl, sizeMap);
    if (changed) {
      await db.siteLeader.update({ where: { id: leader.id }, data: { imageUrl: text } });
      updated++;
    }
  }

  for (const article of await db.siteArticle.findMany()) {
    const { text, changed } = await remap(article.imageUrl, sizeMap);
    if (changed) {
      await db.siteArticle.update({ where: { id: article.id }, data: { imageUrl: text } });
      updated++;
    }
  }

  for (const row of await db.siteContent.findMany()) {
    const value = await remap(row.value, sizeMap);
    const published = await remap(row.publishedValue, sizeMap);
    if (value.changed || published.changed) {
      await db.siteContent.update({
        where: { id: row.id },
        data: { value: value.text, publishedValue: published.text },
      });
      updated++;
    }
  }

  console.log(`References repointed to /api/media: updated=${updated}`);
}

async function main() {
  await migrateBytes();
  await remapReferences();
}

main()
  .then(() => db.$disconnect())
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

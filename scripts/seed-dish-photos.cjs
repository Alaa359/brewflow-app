/**
 * Seed dish photos from Unsplash (free license).
 * Usage: node scripts/seed-dish-photos.cjs
 *
 * Handles accent normalization for French dish names.
 */

const { Client } = require('pg');
const https = require('node:https');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
require('dotenv/config');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'dishes');

// Normalize: remove accents, normalize apostrophes, lowercase, trim
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u2032\u0060]/g, "'")
    .trim();
}

// Unsplash photo URLs mapped to normalized dish names (all verified 200 OK)
const PHOTO_MAP = {
  'the a la menthe': 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&h=400&fit=crop&q=80',
  cafe: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=400&fit=crop&q=80',
  "jus d'orange": 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=400&fit=crop&q=80',
  croissant: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&h=400&fit=crop&q=80',
  omelette: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&h=400&fit=crop&q=80',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop&q=80',
  'tajine poulet': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop&q=80',
  'couscous royal': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop&q=80',
};

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { headers: { 'User-Agent': 'BrewFlow-Seed/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows: dishes } = await client.query(
    'SELECT id, name, "imageUrl" FROM "Dish"'
  );

  console.log(`Found ${dishes.length} dishes in database\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const dish of dishes) {
    const normalizedName = normalize(dish.name);
    const photoUrl = PHOTO_MAP[normalizedName];

    if (!photoUrl) {
      console.log(`  SKIP  "${dish.name}" (key: "${normalizedName}") — no mapping`);
      skipped++;
      continue;
    }

    if (dish.imageUrl) {
      console.log(`  SKIP  "${dish.name}" — already has: ${dish.imageUrl}`);
      skipped++;
      continue;
    }

    try {
      console.log(`  DL    "${dish.name}"...`);
      const buffer = await downloadFile(photoUrl);
      const filename = `${crypto.randomUUID()}.jpg`;
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, buffer);

      const imageUrl = `/uploads/dishes/${filename}`;
      await client.query('UPDATE "Dish" SET "imageUrl" = $1 WHERE id = $2', [
        imageUrl,
        dish.id,
      ]);

      console.log(`  OK    "${dish.name}" → ${imageUrl} (${(buffer.length / 1024).toFixed(0)} KB)`);
      updated++;
    } catch (err) {
      console.error(`  FAIL  "${dish.name}" — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped, ${failed} failed, ${dishes.length} total`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

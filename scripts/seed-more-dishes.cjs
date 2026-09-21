/*  seed-more-dishes.cjs
 *  Ajoute des plats supplémentaires avec images Unsplash
 *  dans les 4 catégories d'El Farès Café.
 *  Usage : node scripts/seed-more-dishes.cjs
 */
require('dotenv/config');
const { Client } = require('pg');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'dishes');

const DISHES = [
  // ═══ BOISSONS ═══
  {
    category: 'Boissons',
    name: 'Espresso Double',
    description: 'Double expresso corsé, aroma intense de torréfaction locale.',
    price: 3.5,
    image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=400&fit=crop',
    file: 'espresso-double.jpg',
  },
  {
    category: 'Boissons',
    name: 'Cappuccino Crème',
    description: 'Expresso onctueux avec mousse de lait crémeuse et cacao saupoudré.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop',
    file: 'cappuccino-creme.jpg',
  },
  {
    category: 'Boissons',
    name: 'Thé Menthe Doux',
    description: 'Thé vert à la menthe fraîche, servi traditionnellement en cruche.',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=400&fit=crop',
    file: 'the-menthe.jpg',
  },
  {
    category: 'Boissons',
    name: 'Smoothie Mangue',
    description: 'Mangue fraîche, yaourt nature et touche de citron vert.',
    price: 7.0,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=400&fit=crop',
    file: 'smoothie-mangue.jpg',
  },
  {
    category: 'Boissons',
    name: 'Limonade Maison',
    description: 'Citrons pressés, menthe fraîche et sirop de canne artisanal.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&h=400&fit=crop',
    file: 'limonade-maison.jpg',
  },
  {
    category: 'Boissons',
    name: 'Jus de Grenade',
    description: 'Grenade pressée à la demande, riche en antioxydants.',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=600&h=400&fit=crop',
    file: 'jus-grenade.jpg',
  },

  // ═══ ENTRÉES ═══
  {
    category: 'Entrées',
    name: 'Salade Méchouia',
    description: 'Tomates et poivrons grillés, ail, huile d\'olive et épices.',
    price: 7.5,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop',
    file: 'salade-mechouia.jpg',
  },
  {
    category: 'Entrées',
    name: 'Bruschetta Tomate',
    description: 'Pain grillé au basilic frais, tomates concassées et mozzarella.',
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=400&fit=crop',
    file: 'bruschetta.jpg',
  },
  {
    category: 'Entrées',
    name: 'Soupe à l\'Oignon',
    description: 'Soupe d\'oignons caramélisés gratinée au fromage Gruyère.',
    price: 9.0,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    file: 'soupe-oignon.jpg',
  },
  {
    category: 'Entrées',
    name: 'Hummus Poussière',
    description: 'Hummus crémeux au citron, servie avec pain pita chaud.',
    price: 7.0,
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&h=400&fit=crop',
    file: 'hummus.jpg',
  },
  {
    category: 'Entrées',
    name: 'Assiette Fromages',
    description: 'Sélection de fromages affinés, confiture de figues et noix.',
    price: 12.0,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&h=400&fit=crop',
    file: 'assiette-fromages.jpg',
  },

  // ═══ PLATS ═══
  {
    category: 'Plats',
    name: 'Poulet Rôti Citron',
    description: 'Poulet fermier rôti au citron, herbes de Provence et légumes.',
    price: 16.0,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop',
    file: 'poulet-roti.jpg',
  },
  {
    category: 'Plats',
    name: 'Pâtes Carbonara',
    description: 'Spaghetti à la carbonara, lardons fumés, pecorino et poivre.',
    price: 14.0,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop',
    file: 'pates-carbonara.jpg',
  },
  {
    category: 'Plats',
    name: 'Poisson Grillé',
    description: 'Filet de poisson frais grillé, sauce citronnée et riz basmati.',
    price: 19.0,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop',
    file: 'poisson-grille.jpg',
  },
  {
    category: 'Plats',
    name: 'Couscous Poisson',
    description: 'Couscous au poisson frais, légumes du moment et harissa maison.',
    price: 17.0,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop',
    file: 'couscous-poisson.jpg',
  },
  {
    category: 'Plats',
    name: 'Steak Frites',
    description: 'Steak de boeuf grillé, frites croustillantes et sauce au poivre.',
    price: 22.0,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop',
    file: 'steak-frites.jpg',
  },
  {
    category: 'Plats',
    name: 'Risotto Champignons',
    description: 'Risotto crémeux aux champignons variés et parmesan râpé.',
    price: 15.0,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop',
    file: 'risotto-champignons.jpg',
  },
  {
    category: 'Plats',
    name: 'Tajine Agneau',
    description: 'Tajine d\'agneau aux abricots secs, amandes et épices orientales.',
    price: 20.0,
    image: 'https://images.unsplash.com/photo-1541518763879-204ab5e39c1c?w=600&h=400&fit=crop',
    file: 'tajine-agneau.jpg',
  },

  // ═══ DESSERTS ═══
  {
    category: 'Desserts',
    name: 'Tiramisu Classique',
    description: 'Mascarpone onctueuse, café espresso et cacao amer.',
    price: 8.5,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop',
    file: 'tiramisu.jpg',
  },
  {
    category: 'Desserts',
    name: 'Crème Brûlée',
    description: 'Crème vanillée caramélisée à la torche, biscuit sablé.',
    price: 9.0,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&h=400&fit=crop',
    file: 'creme-brulee.jpg',
  },
  {
    category: 'Desserts',
    name: 'Mousse au Chocolat',
    description: 'Mousse au chocolat noir 70%, whipped cream et éclats de noisette.',
    price: 7.5,
    image: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&h=400&fit=crop',
    file: 'mousse-chocolat.jpg',
  },
  {
    category: 'Desserts',
    name: 'Pain Perdu',
    description: 'Pain brioche doré, sirop d\'érable, fruits rouges frais.',
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=400&fit=crop',
    file: 'pain-perdu.jpg',
  },
  {
    category: 'Desserts',
    name: 'Baklava',
    description: 'Feuilleté croustillant aux pistaches et miel de thym.',
    price: 6.5,
    image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=600&h=400&fit=crop',
    file: 'baklava.jpg',
  },
  {
    category: 'Desserts',
    name: 'Glace Artisanale',
    description: 'Boules de glace fait maison : vanille, chocolat, pistache.',
    price: 5.0,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&h=400&fit=crop',
    file: 'glace-artisanale.jpg',
  },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (e) => { fs.unlinkSync(dest); reject(e); });
    }).on('error', (e) => { file.close(); fs.unlinkSync(dest); reject(e); });
  });
}

async function main() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('Connected to database');

  // Get establishment + categories
  const est = await client.query(`SELECT id FROM "Establishment" LIMIT 1`);
  const estId = est.rows[0]?.id;
  if (!estId) { console.error('No establishment found'); process.exit(1); }

  const cats = await client.query(`SELECT id, name FROM "Category" WHERE "establishmentId" = $1`, [estId]);
  const catMap = {};
  for (const r of cats.rows) catMap[r.name] = r.id;
  console.log('Categories:', Object.keys(catMap).join(', '));

  let added = 0;
  let skipped = 0;

  for (const d of DISHES) {
    const catId = catMap[d.category];
    if (!catId) { console.log(`  ⚠ Category "${d.category}" not found, skipping`); continue; }

    // Check if dish already exists
    const exists = await client.query(
      `SELECT id FROM "Dish" WHERE "establishmentId" = $1 AND name = $2`,
      [estId, d.name]
    );
    if (exists.rows.length > 0) { skipped++; continue; }

    // Download image
    const imgPath = path.join(UPLOAD_DIR, d.file);
    try {
      await downloadFile(d.image, imgPath);
      console.log(`  ✓ Downloaded: ${d.file}`);
    } catch (e) {
      console.log(`  ✗ Failed: ${d.file} (${e.message})`);
    }

    // Insert dish
    await client.query(
      `INSERT INTO "Dish" (id, name, description, price, "categoryId", "imageUrl", "isActive", "establishmentId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, true, $6, now(), now())`,
      [d.name, d.description, d.price, catId, `/uploads/dishes/${d.file}`, estId]
    );
    added++;
    console.log(`  + ${d.name} (${d.price} DT) → ${d.category}`);
  }

  console.log(`\nDone: ${added} added, ${skipped} skipped`);
  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });

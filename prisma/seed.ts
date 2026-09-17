import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await hash('password123', 10)

  await prisma.membership.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.table.deleteMany()
  await prisma.stockEntry.deleteMany()
  await prisma.recipeIngredient.deleteMany()
  await prisma.dish.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.establishment.deleteMany()

  const [elFares, petitBistrot] = await Promise.all([
    prisma.establishment.create({
      data: {
        name: 'El Farès Café',
        address: 'Avenue Habib Bourguiba, Sousse',
        phone: '+216 73 111 222',
        timezone: 'Africa/Tunis',
      },
    }),
    prisma.establishment.create({
      data: {
        name: 'Le Petit Bistrot',
        address: 'Rue de la Liberté, Tunis',
        phone: '+216 71 333 444',
        timezone: 'Africa/Tunis',
      },
    }),
  ])

  const [admin, serveur, cuisinier] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Admin BrewFlow',
        email: 'admin@brewflow.tn',
        passwordHash,
        role: 'ADMIN',
        memberships: {
          create: [
            { establishmentId: elFares.id },
            { establishmentId: petitBistrot.id },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Serveur Test',
        email: 'serveur@brewflow.tn',
        passwordHash,
        role: 'SERVER',
        memberships: {
          create: {
            establishmentId: elFares.id,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Cuisinier Test',
        email: 'cuisinier@brewflow.tn',
        passwordHash,
        role: 'KITCHEN',
        memberships: {
          create: {
            establishmentId: elFares.id,
          },
        },
      },
    }),
  ])

  const categoriesData = ['Entrées', 'Plats', 'Desserts', 'Boissons'].map(
    (name, i) => ({
      name,
      sortOrder: i + 1,
      establishmentId: elFares.id,
    })
  )
  await prisma.category.createMany({ data: categoriesData })

  const categories = await prisma.category.findMany({
    where: { establishmentId: elFares.id },
  })
  const cat = Object.fromEntries(categories.map((c) => [c.name, c.id]))

  const ingredientsData = [
    ['riz', 'KG', 20, 5, 2.5],
    ['poulet', 'KG', 8, 3, 12],
    ['tomate', 'KG', 10, 2, 1.8],
    ['lait', 'L', 6, 2, 1.4],
    ['café', 'KG', 0.8, 1, 45],
    ['thé', 'KG', 2.5, 1, 30],
    ['menthe', 'KG', 0.3, 0.5, 8],
    ['farine', 'KG', 25, 5, 1.2],
    ['œufs', 'PIECE', 60, 24, 0.45],
    ['huile', 'L', 12, 3, 6],
    ['sucre', 'KG', 15, 4, 2.2],
    ['sel', 'KG', 5, 1, 0.8],
    ['couscous', 'KG', 18, 5, 3.5],
    ['bœuf haché', 'KG', 6, 2, 22],
    ['pain burger', 'PIECE', 40, 12, 0.8],
    ['oranges', 'KG', 15, 4, 2.5],
  ].map(([name, unit, currentStock, minThreshold, costPerUnit]) => ({
    name: name as string,
    unit: unit as 'KG' | 'L' | 'PIECE',
    currentStock: currentStock as number,
    minThreshold: minThreshold as number,
    costPerUnit: costPerUnit as number,
    establishmentId: elFares.id,
  }))
  await prisma.ingredient.createMany({ data: ingredientsData })

  const ingredients = await prisma.ingredient.findMany({
    where: { establishmentId: elFares.id },
  })
  const ing = Object.fromEntries(ingredients.map((i) => [i.name, i.id]))

  const dishes = [
    {
      name: 'Thé à la menthe',
      description: 'Thé vert à la menthe fraîche, servi brûlant.',
      price: 2.5,
      category: 'Boissons',
      recipe: new Map<string, number>([
        ['thé', 0.02],
        ['menthe', 0.05],
        ['sucre', 0.06],
      ]),
    },
    {
      name: 'Café',
      description: 'Café expresso tunisien.',
      price: 1.5,
      category: 'Boissons',
      recipe: new Map<string, number>([
        ['café', 0.01],
        ['lait', 0.05],
        ['sucre', 0.02],
      ]),
    },
    {
      name: 'Jus d’orange',
      description: 'Jus d’orange pressé maison.',
      price: 5,
      category: 'Boissons',
      recipe: new Map<string, number>([
        ['oranges', 0.4],
        ['sucre', 0.02],
      ]),
    },
    {
      name: 'Croissant',
      description: 'Croissant pur beurre.',
      price: 1.8,
      category: 'Desserts',
      recipe: new Map<string, number>([
        ['farine', 0.06],
        ['lait', 0.03],
        ['œufs', 0.5],
        ['sucre', 0.01],
      ]),
    },
    {
      name: 'Omelette',
      description: 'Omelette aux œufs frais.',
      price: 6,
      category: 'Entrées',
      recipe: new Map<string, number>([
        ['œufs', 3],
        ['huile', 0.02],
        ['sel', 0.005],
      ]),
    },
    {
      name: 'Burger',
      description: 'Burger bœuf, tomate et œuf.',
      price: 12,
      category: 'Plats',
      recipe: new Map<string, number>([
        ['pain burger', 1],
        ['bœuf haché', 0.15],
        ['tomate', 0.05],
        ['œufs', 1],
      ]),
    },
    {
      name: 'Tajine poulet',
      description: 'Tajine de poulet aux tomates.',
      price: 15,
      category: 'Plats',
      recipe: new Map<string, number>([
        ['poulet', 0.2],
        ['tomate', 0.1],
        ['œufs', 2],
        ['huile', 0.02],
        ['sel', 0.005],
      ]),
    },
    {
      name: 'Couscous royal',
      description: 'Couscous poulet, bœuf et légumes.',
      price: 18,
      category: 'Plats',
      recipe: new Map<string, number>([
        ['couscous', 0.25],
        ['poulet', 0.2],
        ['bœuf haché', 0.1],
        ['tomate', 0.15],
        ['huile', 0.03],
        ['sel', 0.005],
      ]),
    },
  ]

  for (const dish of dishes) {
    await prisma.dish.create({
      data: {
        name: dish.name,
        description: dish.description,
        price: dish.price,
        categoryId: cat[dish.category],
        establishmentId: elFares.id,
        recipeIngredients: {
          create: [...dish.recipe.entries()].map(([name, qty]) => ({
            ingredientId: ing[name],
            quantityNeeded: qty,
          })),
        },
      },
    })
  }

  const petitBistrotTables = [1, 2, 3, 4].map((n) => ({
    number: n,
    zone: 'Salle',
    qrCode: randomUUID(),
    establishmentId: petitBistrot.id,
  }))

  await prisma.table.createMany({
    data: [
      ...[1, 2, 3, 4].map((n) => ({
        number: n,
        zone: 'Salle',
        qrCode: randomUUID(),
        establishmentId: elFares.id,
      })),
      ...[5, 6, 7, 8].map((n) => ({
        number: n,
        zone: 'Terrasse',
        qrCode: randomUUID(),
        establishmentId: elFares.id,
      })),
      ...petitBistrotTables,
    ],
  })

  const tables = await prisma.table.findMany({
    where: { establishmentId: elFares.id },
  })

  await prisma.stockEntry.createMany({
    data: [
      ['café', 5, 'Importateur Tunis', admin.id],
      ['thé', 10, 'Importateur Tunis', admin.id],
      ['menthe', 2, 'Marché municipal', admin.id],
      ['poulet', 12, 'Abattoir Sousse', admin.id],
      ['bœuf haché', 8, 'Boucherie Centrale', admin.id],
    ].map(([name, qty, supplier, userId]) => ({
      ingredientId: ing[name as string],
      quantityAdded: qty as number,
      supplierName: supplier as string,
      userId: userId as string,
    })),
  })

  const dishesWithCost = await prisma.dish.findMany({
    where: { establishmentId: elFares.id },
    include: { recipeIngredients: { include: { ingredient: true } } },
  })
  const coffee = dishesWithCost.find((d) => d.name === 'Café')!
  const croissant = dishesWithCost.find((d) => d.name === 'Croissant')!

  const payeeOrder = await prisma.order.create({
    data: {
      tableId: tables[0].id,
      status: 'PAYEE',
      totalAmount: 4.5,
      paymentMethod: 'CASH',
      userId: serveur.id,
      orderItems: {
        create: [
          {
            dishId: coffee.id,
            quantity: 2,
            unitPrice: Number(coffee.price),
          },
          {
            dishId: croissant.id,
            quantity: 1,
            unitPrice: Number(croissant.price),
          },
        ],
      },
      payments: {
        create: {
          method: 'CASH',
          amount: 4.5,
          status: 'COMPLETED',
        },
      },
    },
  })

  const burger = dishesWithCost.find((d) => d.name === 'Burger')!
  await prisma.order.create({
    data: {
      tableId: tables[1].id,
      status: 'EN_ATTENTE',
      totalAmount: Number(burger.price),
      userId: serveur.id,
      orderItems: {
        create: [
          { dishId: burger.id, quantity: 1, unitPrice: Number(burger.price) },
        ],
      },
    },
  })

  await prisma.shift.createMany({
    data: [
      [serveur.id, 0, '08:00', '14:00'],
      [cuisinier.id, 0, '08:00', '14:00'],
      [serveur.id, 1, '08:00', '14:00'],
      [cuisinier.id, 1, '08:00', '14:00'],
      [serveur.id, 2, '14:00', '22:00'],
      [cuisinier.id, 2, '14:00', '22:00'],
      [serveur.id, 5, '08:00', '14:00'],
      [cuisinier.id, 5, '08:00', '14:00'],
    ].map(([userId, dayOfWeek, startTime, endTime]) => ({
      userId: userId as string,
      dayOfWeek: dayOfWeek as number,
      startTime: startTime as string,
      endTime: endTime as string,
      establishmentId: elFares.id,
    })),
  })

  console.log('Seed terminé.')
  console.log('Établissements : 2 | Users : 3 (password123)')
  console.log(`Commandes de test : payée (${payeeOrder.id}) + en attente`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
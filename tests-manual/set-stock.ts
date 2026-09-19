import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const est = await prisma.establishment.findFirst({
    where: { name: 'El Farès Café' },
  })
  if (!est) throw new Error('establishment not found')
  const café = await prisma.ingredient.findFirst({
    where: { establishmentId: est.id, name: 'café' },
  })
  if (!café) throw new Error('café not found')
  await prisma.ingredient.update({
    where: { id: café.id },
    data: { currentStock: 0.01 },
  })
  const dish = await prisma.dish.findFirst({
    where: { establishmentId: est.id, name: 'Café' },
    include: { recipeIngredients: { include: { ingredient: true } } },
  })
  if (!dish) throw new Error('Café dish not found')
  console.log(JSON.stringify({
    caféId: café.id,
    caféStock: 0.01,
    dishId: dish.id,
    recipe: dish.recipeIngredients.map((ri) => ({
      ingredient: ri.ingredient.name,
      needed: Number(ri.quantityNeeded),
    })),
    tables: (await prisma.table.findMany({
      where: { establishmentId: est.id },
      select: { id: true, number: true },
    })),
  }, null, 2))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
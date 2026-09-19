import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ingredient = await prisma.ingredient.update({
    where: { id: 'cmu4r171h000hs0vyjrg8xhm3' },
    data: { currentStock: 50 },
    select: { name: true, currentStock: true, minThreshold: true },
  })
  console.log(JSON.stringify({ restored: ingredient.name, stock: Number(ingredient.currentStock) }))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
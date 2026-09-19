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
  const table = await prisma.table.findFirst({
    where: { establishmentId: est.id, number: 1 },
    select: { qrCode: true, number: true },
  })
  const oeufs = await prisma.ingredient.findFirst({
    where: { establishmentId: est.id, name: 'œufs' },
    select: { currentStock: true },
  })
  console.log(JSON.stringify({ table, oeufsStock: Number(oeufs?.currentStock) }, null, 2))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
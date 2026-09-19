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
    select: { currentStock: true, minThreshold: true },
  })
  const todayOrders = await prisma.order.count({
    where: { status: 'PAYEE', createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  })
  console.log(JSON.stringify({ caféStock: Number(café?.currentStock), minThreshold: Number(café?.minThreshold), payeeToday: todayOrders }, null, 2))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
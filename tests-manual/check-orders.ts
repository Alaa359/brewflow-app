import 'dotenv/config'
import { PrismaClient } from '../src/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const orders = await prisma.order.findMany({
    where: { status: { not: 'PAYEE' } },
    select: {
      id: true,
      status: true,
      table: { select: { number: true } },
      totalAmount: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  console.log(JSON.stringify(orders.map((o) => ({
    id: o.id,
    status: o.status,
    table: o.table.number,
    total: Number(o.totalAmount),
  })), null, 2))
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
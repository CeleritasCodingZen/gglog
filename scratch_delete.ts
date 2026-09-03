import { prisma } from './lib/db'

async function run() {
  const result = await prisma.$executeRaw`DELETE FROM "_prisma_migrations" WHERE migration_name = '20260822000000_add_ws_ticket'`
  console.log('Deleted rows:', result)
}
run().catch(console.error).finally(() => process.exit(0))

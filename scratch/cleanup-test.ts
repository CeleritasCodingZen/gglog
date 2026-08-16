/**
 * Clean up test users before running the test suite.
 */
import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function cleanup() {
  // Delete test users created by previous runs
  const testEmails = ['test@gglog.dev', 'sounava@gglog.dev']
  const testUsernames = ['testplayer', 'sounava']

  for (const email of testEmails) {
    await prisma.user.deleteMany({ where: { email } }).catch(() => { })
  }
  for (const username of testUsernames) {
    await prisma.user.deleteMany({ where: { username } }).catch(() => { })
  }

  console.log('✅ Test data cleaned up')
}

cleanup().catch(console.error)

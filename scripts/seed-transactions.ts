import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { transactions } from '../app/lib/db/schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

const accounts = [
  'CHK-001234',
  'CHK-005678',
  'SAV-001111',
  'CC-4532',
  'CC-7891',
]

const expenseCategories = [
  { description: 'Grocery Store', minAmount: -25, maxAmount: -150 },
  { description: 'Electric Bill', minAmount: -80, maxAmount: -200 },
  { description: 'Gas Station', minAmount: -30, maxAmount: -80 },
  { description: 'Internet Service', minAmount: -50, maxAmount: -100 },
  { description: 'Mobile Phone Bill', minAmount: -40, maxAmount: -120 },
  { description: 'Restaurant', minAmount: -15, maxAmount: -100 },
  { description: 'Coffee Shop', minAmount: -5, maxAmount: -15 },
  { description: 'Online Shopping', minAmount: -20, maxAmount: -300 },
  { description: 'Subscription Service', minAmount: -10, maxAmount: -50 },
  { description: 'Pharmacy', minAmount: -10, maxAmount: -80 },
  { description: 'Home Improvement', minAmount: -50, maxAmount: -500 },
  { description: 'Insurance Payment', minAmount: -100, maxAmount: -400 },
  { description: 'Gym Membership', minAmount: -30, maxAmount: -60 },
  { description: 'Streaming Service', minAmount: -10, maxAmount: -25 },
  { description: 'Public Transit', minAmount: -5, maxAmount: -50 },
  { description: 'Parking', minAmount: -5, maxAmount: -30 },
  { description: 'Medical Copay', minAmount: -20, maxAmount: -100 },
  { description: 'Pet Supplies', minAmount: -20, maxAmount: -100 },
  { description: 'Clothing Store', minAmount: -30, maxAmount: -200 },
  { description: 'Electronics', minAmount: -50, maxAmount: -800 },
]

const incomeCategories = [
  { description: 'Salary Deposit', minAmount: 2500, maxAmount: 5000 },
  { description: 'Freelance Payment', minAmount: 200, maxAmount: 1500 },
  { description: 'Interest Earned', minAmount: 5, maxAmount: 50 },
  { description: 'Refund', minAmount: 20, maxAmount: 200 },
  { description: 'Cash Deposit', minAmount: 50, maxAmount: 500 },
  { description: 'Transfer In', minAmount: 100, maxAmount: 1000 },
]

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomDate(monthsBack: number): Date {
  const now = new Date()
  const daysBack = Math.floor(Math.random() * (monthsBack * 30))
  const date = new Date(now)
  date.setDate(date.getDate() - daysBack)
  return date
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function generateTransactions(count: number, userId: string) {
  const txns = []

  for (let i = 0; i < count; i++) {
    // 75% expenses, 25% income
    const isExpense = Math.random() < 0.75
    const categories = isExpense ? expenseCategories : incomeCategories
    const category = categories[Math.floor(Math.random() * categories.length)]

    const amount = randomBetween(
      category.minAmount,
      category.maxAmount,
    ).toFixed(2)
    const account = accounts[Math.floor(Math.random() * accounts.length)]
    const date = randomDate(6) // Last 6 months

    // Add some variation to descriptions
    const descriptionVariations = [
      category.description,
      `${category.description} - ${['Main St', 'Downtown', 'Online', 'Local'][Math.floor(Math.random() * 4)]}`,
      category.description,
    ]

    txns.push({
      userId,
      date: formatDate(date),
      accountNo: account,
      description:
        descriptionVariations[
          Math.floor(Math.random() * descriptionVariations.length)
        ],
      amount,
    })
  }

  // Sort by date descending
  txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return txns
}

async function seed() {
  console.log('🌱 Starting seed...')

  // Generate between 60-120 transactions
  const count = Math.floor(randomBetween(60, 120))

  const userId = '08ad4845-2f67-49cc-81ec-6986cec04446'

  const txns = generateTransactions(count, userId)

  console.log(`📝 Inserting ${txns.length} transactions...`)

  // Clear existing transactions (optional - comment out if you want to append)
  await db.delete(transactions)
  console.log('🗑️  Cleared existing transactions')

  // Insert in batches of 50
  const batchSize = 50
  for (let i = 0; i < txns.length; i += batchSize) {
    const batch = txns.slice(i, i + batchSize)
    await db.insert(transactions).values(batch)
    console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1}`)
  }

  console.log(`✅ Seeded ${txns.length} transactions successfully!`)
  console.log('')
  console.log('Sample transactions:')
  txns.slice(0, 5).forEach((t) => {
    console.log(
      `  ${t.date} | ${t.accountNo} | ${t.description.padEnd(30)} | ${Number(t.amount) >= 0 ? '+' : ''}${t.amount}`,
    )
  })

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

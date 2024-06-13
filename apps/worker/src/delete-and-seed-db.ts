import { stocks } from '../../../packages/db/src/seed-db/stocks-data'
import { connectToDatabase, Stock } from '@repo/db'

async function main() {
  const db = await connectToDatabase()

  await Stock.destroy({ where: {} })
  await Stock.bulkCreate(stocks.map(({ s, n, i }) => ({ companyName: n, symbol: s })))
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
import { CreationAttributes } from "@sequelize/core";
import { Stock,   } from "./models";

const predefinedStocks = [
  { symbol: 'AAPL', companyName: 'Apple Inc.' },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.' },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation' },
]

function generateStockData(count: number): { symbol: string; companyName: string }[] {
  const stocks: { symbol: string; companyName: string }[] = []
  for (let i = 0; i < count; i++) {
    const stock = predefinedStocks[i % predefinedStocks.length]
    stocks.push({
      symbol: `${stock.symbol}${i}`,
      companyName: stock.companyName,
    })
  }
  return stocks
}

export async function seedStocks() {
  const stockData: readonly CreationAttributes<Stock>[] = generateStockData(1000)

  try {
    await Stock.bulkCreate(stockData)
    console.log('Stocks have been seeded successfully.')
  } catch (error) {
    console.error('Failed to seed stocks:', error)
  }
}



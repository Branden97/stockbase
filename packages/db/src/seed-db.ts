import { CreationAttributes, InferAttributes } from '@sequelize/core'
import { Stock, StockPrice } from './models'

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

// implement seedStockPrices

export async function seedStockPrices() {
  const stockPrices: Omit<InferAttributes<StockPrice>, 'id'>[] = []
  const stocks = await Stock.findAll()
  for (const stock of stocks) {
    for (let i = 0; i < 100; i++) {
      stockPrices.push({
        stockId: stock.id,
        price: `${Math.random() * (1000 - 0.00000001) + 0.00000001}`,
        recordedAt: new Date(Date.now() - i * 1000),
      })
    }
  }

  try {
    await StockPrice.bulkCreate(stockPrices)
    console.log('Stock prices have been seeded successfully.')
  } catch (error) {
    console.error('Failed to seed stock prices:', error)
  }
}

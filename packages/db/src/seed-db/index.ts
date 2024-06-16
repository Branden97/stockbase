import { CreationAttributes, InferAttributes } from '@sequelize/core'
import { Stock, StockPrice } from '../models'
import { stocks } from './stocks-data'

export async function seedStocks() {
  try {
    // Doing this in the worker now
    // await Stock.bulkCreate(stocks.map((stock) => ({ symbol: stock.s, companyName: stock.n })))
    // console.log('Stocks have been seeded successfully.')
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

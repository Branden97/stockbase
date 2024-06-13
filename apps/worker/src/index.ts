import { stocks as stocksData } from '../../../packages/db/src/seed-db/stocks-data'
import { connectToDatabase, Stock, StockPrice } from '@repo/db'

import yahooFinance from 'yahoo-finance2'
import Bottleneck from 'bottleneck'

// Create a limiter to handle rate limits
const limiter = new Bottleneck({
  minTime: 5000, // minimum time between each request in milliseconds (1000 ms = 1 second)
})

let stocks: Stock[] = []

async function fetchAndSaveStockPrices(symbols: string[]): Promise<void> {
  try {
    // Fetch real-time stock prices for the batch
    const quotes = await yahooFinance.quote(symbols, {fields: ['symbol', 'regularMarketPrice', 'regularMarketTime']})
    console.log(`Fetched ${quotes.length} stock prices:`, JSON.stringify(quotes, null, 2))

    // Save each stock price to the database
    const stockPrices = (Array.isArray(quotes) ? quotes : [quotes])
      .map(coerceQuoteToStockPrice)
      .filter(Boolean) as StockPrice[]

    await StockPrice.bulkCreate(stockPrices)
    console.log(`Saved ${stockPrices.length} stock prices`)
  } catch (error) {
    if (error.name === 'FailedYahooValidationError') {
      console.log('yo yo yo', error.result)
      const validQuotes = error.result.filter((quote: any) => quote.symbol && quote.regularMarketPrice !== undefined && quote.regularMarketTime)
      const stockPrices = validQuotes.map(coerceQuoteToStockPrice).filter(Boolean) as StockPrice[]
      await StockPrice.bulkCreate(stockPrices)
      console.log(`Saved ${stockPrices.length} stock prices (even after error)`)
    } else {
      console.error(`Error fetching or saving data for symbols ${symbols}:`, error)
    }
  }
}

function coerceQuoteToStockPrice(quote: any): StockPrice | null {
  const stockId = stocks.find((stock) => stock.symbol === quote.symbol)?.id
  if (!stockId) {
    console.error(`Stock not found for symbol ${quote.symbol}`)
    return null
  }
  return {
    stockId,
    price: quote.regularMarketPrice !== undefined ? `${quote.regularMarketPrice}` : '0',
    recordedAt: quote.regularMarketTime || new Date(),
  }
}

async function main(): Promise<void> {
  const db = await connectToDatabase()
  stocks = await Stock.findAll()
  // List of stock symbols to fetch
  const stockSymbols: string[] = stocksData.map(({ s }) => s)
  const batchSize = 1000 // stocksData.length // Number of symbols per batch

  // Split stock symbols into batches
  for (let i = 0; i < stockSymbols.length; i += batchSize) {
    const batch = stockSymbols.slice(i, i + batchSize)

    // Fetch and save each batch of stock prices
    console.log(`gonna fetch ${batch.length} stocks...`)
    await limiter.schedule(() => fetchAndSaveStockPrices(batch));
    // break
  }

  console.log('done')
  // Close the database connection
  await db.close()
  process.exit(0)
}

main().catch((error) => {
  console.error('Error in main function:', error)
})

import { connectToDatabase, Stock, StockPrice } from '@repo/db'
import yahooFinance from 'yahoo-finance2'
import { chunk } from 'lodash'
import Bottleneck from 'bottleneck'
// eslint-disable-next-line import/no-relative-packages -- some issue with the @repo/db import
import { stocks as stocksData } from '../../../packages/db/src/seed-db/stocks-data'

// Create a limiter to handle rate limits
const limiter = new Bottleneck({
  minTime: 5000, // minimum time between each request in milliseconds (1000 ms = 1 second)
})

let allStocks: Stock[] = []
let stockSymbols: string[] = []

/**
 * Fetches stock prices and saves them to the database.
 * @param symbols List of stock symbols to fetch prices for.
 * @param phase The current market phase.
 */
async function fetchAndSaveStockPrices(symbols: string[], phase: string): Promise<void> {
  try {
    console.log(`Fetching ${phase} stock prices...`)
    const symbolChunks = chunk(symbols, 500) // Split symbols into chunks of 500

    const fetchPromises = symbolChunks.map(async (chunk) => {
      const chunkQuotes = await limiter.schedule(() =>
        yahooFinance.quote(chunk, {
          fields: getFieldsForPhase(phase),
        })
      )

      console.log(`Fetched ${chunkQuotes.length} ${phase} stock prices for chunk:`)

      const stockPrices = (Array.isArray(chunkQuotes) ? chunkQuotes : [chunkQuotes])
        .map(coerceQuoteToStockPrice)
        .filter(Boolean) as StockPrice[]

      await StockPrice.bulkCreate(stockPrices, { logging: false })
      console.log(`Saved ${stockPrices.length} ${phase} stock prices for chunk`)
    })

    await Promise.all(fetchPromises)
  } catch (error) {
    handleFetchError(error, symbols)
  }
}

/**
 * Returns the appropriate fields for the current market phase.
 * @param phase The current market phase.
 * @returns An array of fields to fetch.
 */
function getFieldsForPhase(phase: string): string[] {
  switch (phase) {
    case 'premarket':
      return ['symbol', 'preMarketPrice', 'preMarketTime']
    case 'normal':
      return ['symbol', 'regularMarketPrice', 'regularMarketTime']
    case 'postmarket':
      return ['symbol', 'postMarketPrice', 'postMarketTime']
    default:
      return ['symbol', 'regularMarketPrice', 'regularMarketTime']
  }
}

/**
 * Handles errors that occur during the fetch process.
 * @param error The error object.
 * @param symbols List of stock symbols that were being fetched.
 */
async function handleFetchError(error: any, symbols: string[]): Promise<void> {
  if (error?.name === 'FailedYahooValidationError') {
    const validQuotes = error.result.filter(
      (quote: any) =>
        quote.symbol && quote.regularMarketPrice !== undefined && quote.regularMarketTime
    )
    const stockPrices = validQuotes.map(coerceQuoteToStockPrice).filter(Boolean) as StockPrice[]
    await StockPrice.bulkCreate(stockPrices, { logging: false })
    console.log(`Saved ${stockPrices.length} stock prices (even after error)`)
  } else {
    console.error(`Error fetching or saving data for symbols ${symbols}:`, error)
  }
}

/**
 * Converts a quote to a StockPrice object.
 * @param quote The quote object from Yahoo Finance.
 * @returns A StockPrice object or null if the stock symbol is not found.
 */
function coerceQuoteToStockPrice(quote: any): StockPrice | null {
  const stockId = allStocks.find((stock) => stock.symbol === quote.symbol)?.id
  if (!stockId) {
    console.error(`Stock not found for symbol ${quote.symbol}`)
    return null
  }
  return {
    stockId,
    price: quote.preMarketPrice || quote.regularMarketPrice || quote.postMarketPrice || '0',
    recordedAt:
      quote.preMarketTime || quote.regularMarketTime || quote.postMarketTime || new Date(),
  } as unknown as StockPrice
}

/**
 * Generates random stock prices and saves them to the database.
 */
async function generateRandomStockPrices(): Promise<void> {
  const stockPrices: StockPrice[] = allStocks.map((stock) => {
    const randomPrice = Math.random() * 1000 // Generate a random price
    return {
      id: undefined,
      stockId: stock.id,
      price: randomPrice.toFixed(2),
      recordedAt: new Date(),
    }
  }) as unknown as StockPrice[]

  console.log(`Saving ${stockPrices.length} random stock prices...`)

  // Chunk the stock prices into smaller batches
  const chunkedStockPrices = chunk(stockPrices, 500) // Adjust the size as needed

  for (const batch of chunkedStockPrices) {
    await StockPrice.bulkCreate(batch, { logging: false })
  }

  console.log(`Saved!`)
}

/**
 * Generates random stock prices and saves them to the database in chunks.
 */
async function generateRandomStockPricesDirect(): Promise<void> {
  if (allStocks.length === 0) allStocks = await Stock.findAll()
  const now = new Date()

  // Shuffle the array to randomize the stock IDs
  for (let i = allStocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allStocks[i], allStocks[j]] = [allStocks[j], allStocks[i]]
  }

  // Calculate chunk size (a quarter of the total stocks)
  const chunkSize = Math.ceil(allStocks.length / 10)

  // Function to process a chunk of stocks
  async function processChunk(chunk: any[]) {
    const chunkNewPrices = chunk.map((stock) => {
      const randomPrice = Math.random() * 1000 // Generate a random price
      const percentChange =
        ((randomPrice - parseFloat(stock.latestPrice)) / parseFloat(stock.latestPrice)) * 100
      stock.latestPrice =
        isFinite(randomPrice) && !isNaN(randomPrice) ? randomPrice.toFixed(2) : '1'
      stock.percentChange =
        isFinite(percentChange) && !isNaN(percentChange) ? percentChange.toFixed(2) : '1'
      return {
        id: stock.id,
        symbol: stock.symbol,
        companyName: stock.companyName,
        industry: stock.industry,
        latestPrice: stock.latestPrice,
        percentChange: stock.percentChange,
        price: randomPrice.toFixed(2),
        recordedAt: now,
      }
    })
    console.log(`Saving ${chunkNewPrices.length} random stock prices...`)
    await Stock.bulkCreate(chunkNewPrices, {
      updateOnDuplicate: ['latestPrice', 'percentChange', 'recordedAt'],
      logging: false,
    })
    console.log(`Saved chunk of ${chunkNewPrices.length} stocks!`)
  }

  // Process each chunk serially
  for (let i = 0; i < allStocks.length; i += chunkSize) {
    const chunk = allStocks.slice(i, i + chunkSize)
    await processChunk(chunk)
    // wait a second between
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

/**
 * Determines the current market phase and runs the appropriate function.
 */
async function runBasedOnMarketTime(): Promise<void> {
  const currentTime = new Date()
  const currentHour = currentTime.getUTCHours()
  const currentDay = currentTime.getUTCDay()
  try {
    if (isWeekend(currentDay)) {
      await generateRandomStockPricesDirect()
    } else if (isPremarket(currentHour)) {
      await fetchAndSaveStockPrices(stockSymbols, 'premarket')
    } else if (isNormalMarket(currentHour)) {
      await fetchAndSaveStockPrices(stockSymbols, 'normal')
    } else if (isPostmarket(currentHour)) {
      await fetchAndSaveStockPrices(stockSymbols, 'postmarket')
    } else {
      await generateRandomStockPricesDirect()
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * Checks if the current day is a weekend.
 * @param day The current day of the week.
 * @returns True if it's a weekend, false otherwise.
 */
function isWeekend(day: number): boolean {
  return day === 0 || day === 6
}

/**
 * Checks if the current hour is within premarket hours.
 * @param hour The current hour of the day.
 * @returns True if it's premarket hours, false otherwise.
 */
function isPremarket(hour: number): boolean {
  return hour >= 13 && hour < 20
}

/**
 * Checks if the current hour is within normal market hours.
 * @param hour The current hour of the day.
 * @returns True if it's normal market hours, false otherwise.
 */
function isNormalMarket(hour: number): boolean {
  return hour >= 20 && hour < 23
}

/**
 * Checks if the current hour is within postmarket hours.
 * @param hour The current hour of the day.
 * @returns True if it's postmarket hours, false otherwise.
 */
function isPostmarket(hour: number): boolean {
  return hour >= 23 || hour < 1
}

/**
 * Initializes the database and fetches the list of stock symbols.
 */
async function initialize(): Promise<void> {
  const db = await connectToDatabase()
  const stocksCount = await Stock.count()
  if (stocksCount === 0) {
    // Fill stocks table with stocksData
    await Stock.bulkCreate(
      stocksData.map((s) => ({
        symbol: s.s,
        companyName: s.n,
        industry: `${s.i}`,
        recordedAt: new Date(),
        latestPrice: `${(Math.random() * 1000).toFixed(2)}`,
        percentChange: `${(Math.random() * 1000).toFixed(2)}`,
      })),
      { logging: false }
    )
  }
  allStocks = await Stock.findAll()
  stockSymbols = allStocks.map((stock) => stock.symbol)
  // await db.close()
}

/**
 * Main function to run the initial fetch and start the interval runner.
 */
async function main(): Promise<void> {
  await initialize()
  // await runBasedOnMarketTime()
  await generateRandomStockPricesDirect()
  setInterval(generateRandomStockPricesDirect, 3000)
}

main().catch((error) => {
  console.error('Error in main function:', error)
})

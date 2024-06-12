import { Stock, Watchlist, WatchlistStock } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the payload which includes the name of the watchlist and optional stock IDs
interface CreateWatchlistPayload {
  name: string
  stockIds?: number[]
}

// Define the type for the response, if needed
interface WatchlistResponse {
  id: number
  name: string
  stocks: Stock[]
}

/**
 * Handles the request to create a new watchlist and optionally add stocks to it.
 * 
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const createWatchlistHandler: RequestHandler = asyncHandler(
  async (req: Request<unknown, WatchlistResponse, CreateWatchlistPayload>, res, next) => {
    // Extract userId from the request object
    const userId = req.userId as number | undefined
    if (userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // Extract and validate the request body
    const { name, stockIds } = req.body
    if (!name) {
      res.status(400).json({ message: 'Watchlist name is required' })
      return
    }

    try {
      // Create a new watchlist
      const newWatchlist = await Watchlist.create({ name, userId })
      let addedStocks: Stock[] = []

      // If stock IDs are provided, add the stocks to the new watchlist
      if (stockIds && stockIds.length > 0) {
        const stocksRequestedToAdd = await Stock.findAll({ where: { id: stockIds } })
        const existingWatchlistStocks = await WatchlistStock.findAll({
          where: { watchlistId: newWatchlist.id, stockId: stockIds },
        })

        // Bulk create watchlist-stock associations for new stocks
        if (stocksRequestedToAdd.length > 0) {
          await WatchlistStock.bulkCreate(
            stocksRequestedToAdd.map((stock) => ({
              watchlistId: newWatchlist.id,
              stockId: stock.id,
            }))
          )
          addedStocks = stocksRequestedToAdd
        }
      }

      // Construct the response object
      const response: WatchlistResponse = {
        id: newWatchlist.id,
        name: newWatchlist.name,
        stocks: addedStocks.map((stock) => stock.toJSON()),
      }
      
      // Send the response with a 201 status code indicating successful creation
      res.status(201).json(response)
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

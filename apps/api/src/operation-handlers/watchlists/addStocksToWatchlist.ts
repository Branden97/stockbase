import { Stock, Watchlist, WatchlistStock } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the payload which is an array of stock IDs
type AddStocksToWatchlistPayload = number[]

// Define the type for request parameters which includes the watchlist ID
interface Params {
  watchlistId: number | string
}

/**
 * Handles the request to add stocks to a watchlist.
 * 
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const addStocksToWatchlistHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, unknown, AddStocksToWatchlistPayload>, res, next) => {
    // Extract user ID from the request
    const userId = req.userId as number | undefined

    // Parse the watchlist ID from the request parameters
    const watchlistId = parseInt(`${req.params.watchlistId}`)

    // If the user is not authorized, return a 401 Unauthorized response
    if (userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    try {
      // Find the watchlist for the given user and watchlist ID
      const watchlist = await Watchlist.findOne({ where: { id: watchlistId, userId } })
      
      // If the watchlist is not found, return a 404 Not Found response
      if (!watchlist) {
        res.status(404).json({ message: 'Watchlist not found' })
        return
      }

      // Find all stocks that the user wants to add
      const stocksRequestedToAdd = await Stock.findAll({ where: { id: req.body } })

      // If no stocks are found, return a 404 Not Found response
      if (stocksRequestedToAdd.length === 0) {
        res.status(404).json({ message: 'Stock(s) not found' })
        return
      }

      // Find all stocks that are already in the watchlist
      const existingWatchlistStocks = await WatchlistStock.findAll({
        where: { watchlistId, stockId: req.body },
      })

      // Filter out stocks that are already in the watchlist
      const newStocksToAdd = stocksRequestedToAdd.filter(
        (newStock) =>
          !existingWatchlistStocks.find((existingStock) => existingStock.stockId === newStock.id)
      )

      // If all stocks to add are already in the watchlist, return a 409 Conflict response
      if (newStocksToAdd.length === 0) {
        res.status(409).json({ message: 'Stock(s) already in watchlist' })
        return
      }

      // Add the new stocks to the watchlist
      await WatchlistStock.bulkCreate(
        newStocksToAdd.map((stock) => ({
          watchlistId,
          stockId: stock.id,
        }))
      )

      // Return a 201 Created response with the added stocks
      res.status(201).json(newStocksToAdd.map((stock) => stock.toJSON()))
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

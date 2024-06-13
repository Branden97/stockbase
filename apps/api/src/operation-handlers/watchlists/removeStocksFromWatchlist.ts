import { Watchlist, WatchlistStock } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the request payload which is an array of stock IDs
type RemoveStocksFromWatchlistPayload = number[]

// Define the type for request parameters which includes the watchlist ID
interface Params {
  watchlistId: number | string
}

/**
 * Handles the request to remove stocks from a watchlist.
 *
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const removeStocksFromWatchlistHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, unknown, RemoveStocksFromWatchlistPayload>, res, next) => {
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

      // Remove the specified stocks from the watchlist
      const stocksRemoved = await WatchlistStock.destroy({
        where: { watchlistId, stockId: req.body },
      })

      // If no stocks were removed, return a 404 Not Found response
      if (stocksRemoved === 0) {
        res.status(404).json({ message: 'Stock(s) not found in watchlist' })
        return
      }

      // Return a 204 No Content response indicating successful removal
      res.status(204).send()
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

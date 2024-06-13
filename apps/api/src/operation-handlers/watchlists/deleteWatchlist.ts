import { Watchlist } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for request parameters which includes the watchlist ID
interface Params {
  watchlistId: number | string
}

/**
 * Handles the request to delete a watchlist.
 *
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const deleteWatchlistHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, unknown, unknown>, res, next) => {
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

      // Delete the watchlist (cascade delete should handle deleting watchlistStocks)
      await watchlist.destroy()

      // Return a 204 No Content response indicating successful deletion
      res.status(204).send()
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

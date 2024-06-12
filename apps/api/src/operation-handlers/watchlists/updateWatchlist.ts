import { Watchlist } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the payload
interface UpdateWatchlistHandlerPayload {
  name: string
}

// Define the type for request parameters which includes the watchlist ID
// TODO: implement TypeScript Types code-gen from the OpenAPI schema to make this DRY
interface Params {
  watchlistId: number | string
}

/**
 * Handles the request to update a watchlist's name
 * 
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const updateWatchlistHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, unknown, UpdateWatchlistHandlerPayload>, res, next) => {
    // Extract user ID from the request (assuming it's set in a middleware)
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

      // Update the watchlist with the new name
      watchlist.name = req.body.name
      await watchlist.save()

      // Return a 200 OK response with the updated watchlist
      res.status(200).json(watchlist.toJSON())
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

import { Stock } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

interface Parameters {
  stockId: string
}

/**
 * Handles the request to get stock details.
 *
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response containing the stock details.
 */
export const getStockHandler: RequestHandler = asyncHandler(
  async (req: Request<Parameters>, res, next) => {
    // Extract stockId from the url parameters
    const { stockId } = req.params
    if (!stockId) {
      res.status(400).json({ message: 'stockId is required' })
      return
    }

    try {
      // Fetch the stock from the database
      const stock = await Stock.findByPk(stockId)
      if (!stock) {
        res.status(404).json({ message: 'Stock not found' })
        return
      }

      // Send the response with a 200 status code containing the stock details
      res.status(200).json(stock.toJSON())
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

import { StockPrice, Stock } from '@repo/db'
import type { RequestHandler, Request } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { getPaginationMeta } from '../../middlewares/pagination-middleware'

interface PathParams {
  stockId: string
}

export const getStockPricesHandler: RequestHandler = asyncHandler(
  async (req: Request<PathParams>, res, next) => {
    const { stockId } = req.params
    const limit = req.query.limit as unknown as number
    const offset = req.query.offset as unknown as number

    if (!stockId) {
      res.status(400).json({ message: 'stockId is required' })
      return
    }

    try {
      const stock = await Stock.findByPk(stockId)
      if (!stock) {
        res.status(404).json({ message: 'Stock not found' })
        return
      }
      const prices = await StockPrice.findAndCountAll({
        where: { stockId },
        // sort by recordedAt in descending order
        order: [['recordedAt', 'DESC']],
        limit,
        offset,
      })
      const itemCount = prices.count

      res.json({
        prices: prices.rows.map((price) => price.toJSON()),
        paginationMeta: getPaginationMeta(req, itemCount),
      })
    } catch (err) {
      next(err)
    }
  }
)

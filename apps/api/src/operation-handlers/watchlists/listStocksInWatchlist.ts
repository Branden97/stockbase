import { Stock, Watchlist, WatchlistStock } from '@repo/db'
import type { RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { getPaginationMeta } from '../../utils/pagination-utils'

export const listStocksInWatchlistHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  const limit = req.query.limit as number
  const userId = req.userId as number | undefined
  const watchlistId = req.params.watchlistId as number | string | undefined
  if (userId === undefined) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  if (watchlistId === undefined || isNaN(parseInt(`${watchlistId}`))) {
    res.status(400).json({ message: 'Invalid watchlist ID' })
    return
  }

  try {
    // TODO: make this one query using joins
    const watchlist = await Watchlist.findOne({ where: { id: watchlistId, userId } })
    if (!watchlist) {
      res.status(404).json({ message: 'Watchlist not found' })
      return
    }
    const stocks = await Stock.findAndCountAll({
      limit,
      offset: req.skip,
      include: [
        {
          model: WatchlistStock,
          where: { watchlistId },
        },
      ],
    })
    const itemCount = stocks.count

    res.json({
      stocks: stocks.rows.map((stock) => stock.toJSON()),
      paginationMeta: getPaginationMeta(req, itemCount),
    })
  } catch (err) {
    next(err)
  }
})

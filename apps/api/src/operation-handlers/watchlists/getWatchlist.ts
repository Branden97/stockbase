import { Watchlist } from '@repo/db'
import type { RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

export const getWatchlistHandler: RequestHandler = asyncHandler(async (req, res, next) => {
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
    const watchlist = await Watchlist.findOne({ where: { id: watchlistId, userId } })
    if (!watchlist) {
      res.status(404).json({ message: 'Watchlist not found' })
      return
    }
    res.json(watchlist.toJSON())
  } catch (err) {
    next(err)
  }
})

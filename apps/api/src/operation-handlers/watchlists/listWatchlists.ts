import { Watchlist } from '@repo/db'
import type { RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { getPaginationMeta } from '../../utils/pagination-utils'

export const listWatchlistsHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  const limit = req.query.limit as number
  const userId = req.userId as number | undefined
  if (userId === undefined) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  try {
    const results = await Watchlist.findAndCountAll({ limit, offset: req.skip, where: { userId } })
    const itemCount = results.count

    res.json({
      watchlists: results.rows.map((watchlist) => watchlist.toJSON()),
      paginationMeta: getPaginationMeta(req, itemCount),
    })
  } catch (err) {
    next(err)
  }
})

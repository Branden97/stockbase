import { Stock } from '@repo/db'
import type { RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { getPaginationMeta } from '../../utils/pagination-utils'

export const listStocksHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  const limit = req.query.limit as number
  //      ^?
  try {
    const results = await Stock.findAndCountAll({ limit, offset: req.skip })
    const itemCount = results.count

    res.json({
      stocks: results.rows.map((stock) => stock.toJSON()),
      paginationMeta: getPaginationMeta(req, itemCount),
      // pages: getArrayPages(req)(3, pageCount, req.query.page),
    })
  } catch (err) {
    next(err)
  }
})

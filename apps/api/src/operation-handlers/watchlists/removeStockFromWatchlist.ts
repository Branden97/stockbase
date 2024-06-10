import { RequestHandler } from 'express'

export const removeStockFromWatchlistHandler: RequestHandler = (req, res) => {
  res.status(204).json()
}

import { RequestHandler } from 'express'

export const addStockToWatchlistHandler: RequestHandler = (req, res) => {
  res.status(201).json({
    id: 1,
    watchlistId: 1,
    stockId: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  })
}

import { RequestHandler } from 'express'

export const createWatchlistHandler: RequestHandler = (req, res) => {
  res.status(201).json({
    id: 1,
    name: 'New Watchlist',
    userId: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  })
}

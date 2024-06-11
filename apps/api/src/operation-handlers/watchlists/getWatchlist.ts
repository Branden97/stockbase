import { RequestHandler } from 'express'

export const getWatchlistHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    name: 'Tech Stocks',
    userId: 1,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  })
}

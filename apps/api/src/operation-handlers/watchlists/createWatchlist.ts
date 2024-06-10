import { RequestHandler } from 'express'

export const createWatchlistHandler: RequestHandler = (req, res) => {
  res.status(201).json({
    id: 1,
    name: 'New Watchlist',
    user_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

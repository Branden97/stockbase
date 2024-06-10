import { RequestHandler } from 'express'

export const updateWatchlistHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    name: 'Updated Watchlist',
    user_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

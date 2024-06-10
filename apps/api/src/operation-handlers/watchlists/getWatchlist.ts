import { RequestHandler } from 'express'

export const getWatchlistHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    name: 'Tech Stocks',
    user_id: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

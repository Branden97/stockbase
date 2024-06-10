import { RequestHandler } from 'express'

export const getStockHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    symbol: 'AAPL',
    company_name: 'Apple Inc.',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

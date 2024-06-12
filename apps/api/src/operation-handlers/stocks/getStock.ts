import { RequestHandler } from 'express'

export const getStockHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  })
}

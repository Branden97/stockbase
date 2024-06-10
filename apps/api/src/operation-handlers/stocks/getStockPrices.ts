import { RequestHandler } from 'express'

export const getStockPricesHandler: RequestHandler = (req, res) => {
  res.json([
    {
      id: 1,
      stock_id: 1,
      price: 150.25,
      recorded_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ])
}

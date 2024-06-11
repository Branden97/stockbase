import { RequestHandler } from 'express'

export const getStockPricesHandler: RequestHandler = (req, res) => {
  res.json([
    {
      id: 1,
      stockId: 1,
      price: 150.25,
      recordedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ])
}

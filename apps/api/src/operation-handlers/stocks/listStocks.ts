import { RequestHandler } from 'express'

export const listStocksHandler: RequestHandler = (req, res) => {
  res.json([
    {
      id: 1,
      symbol: 'AAPL',
      company_name: 'Apple Inc.',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      symbol: 'GOOGL',
      company_name: 'Alphabet Inc.',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 3,
      symbol: 'MSFT',
      company_name: 'Microsoft Corporation',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  ])
}

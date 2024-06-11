import { RequestHandler } from 'express'

export const getUserHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    username: 'user1',
    email: 'user1@example.com',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  })
}

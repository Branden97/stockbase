import { RequestHandler } from 'express'

export const getUserHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    username: 'user1',
    email: 'user1@example.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

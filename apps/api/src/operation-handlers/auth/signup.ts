import { RequestHandler } from 'express'

export const signupHandler: RequestHandler = (req, res) => {
  res.status(201).json({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

import { RequestHandler } from 'express'

export const updateUserHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    username: 'updatedUser',
    email: 'updated@example.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  })
}

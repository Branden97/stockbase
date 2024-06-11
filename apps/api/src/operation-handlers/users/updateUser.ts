import { RequestHandler } from 'express'

export const updateUserHandler: RequestHandler = (req, res) => {
  res.json({
    id: 1,
    username: 'updatedUser',
    email: 'updated@example.com',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  })
}

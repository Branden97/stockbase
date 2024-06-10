import { RequestHandler } from 'express'

export const deleteUserHandler: RequestHandler = (req, res) => {
  res.status(204).json()
}

import { RequestHandler } from 'express'

export const logoutHandler: RequestHandler = (req, res) => {
  res.status(204).json()
}

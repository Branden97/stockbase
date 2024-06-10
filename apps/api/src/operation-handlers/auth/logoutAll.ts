import { RequestHandler } from 'express'

export const logoutAllHandler: RequestHandler = (req, res) => {
  res.status(204).json()
}

import { RequestHandler } from 'express'

export const deleteWatchlistHandler: RequestHandler = (req, res) => {
  res.status(204).json()
}

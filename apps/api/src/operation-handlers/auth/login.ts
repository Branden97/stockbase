import { RequestHandler } from 'express'

export const loginHandler: RequestHandler = (req, res) => {
  res.json({ token: 'example.jwt.token' })
}

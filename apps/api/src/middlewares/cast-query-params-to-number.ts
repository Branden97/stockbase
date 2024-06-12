import type { NextFunction, Response } from 'express'

export const castQueryParamsToNumber = (
  req: Express.Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.query.limit) {
    req.query.limit = Number(req.query.limit)
  }
  if (req.query.page) {
    req.query.page = Number(req.query.page)
  }
  next()
}

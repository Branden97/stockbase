import { type Sequelize } from '@sequelize/core'
import type { Response, NextFunction, Request } from 'express'
import type { Query } from 'express-serve-static-core'
import type { JwtService, type JwtGeneratedPayload } from '../middlewares/auth-middleware'

export interface AsyncRequestHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query & {
    limit: number
    page: number
  },
  LocalsObj extends Record<string, any> = Record<string, any>,
> {
  // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2)
  (
    req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
    res: Response<ResBody, LocalsObj>,
    next: NextFunction
  ): Promise<void>
}
declare global {
  namespace Express {
    export interface Request {
      refreshTokenPayload?: JwtGeneratedPayload
      tokenPayload?: JwtGeneratedPayload
      userId?: integer
      cookies?: Record<string, string>
      query: {
        limit: number
        page: number
      }
    }
    interface Application {
      db: Sequelize
      jwtService: JwtService
    }
  }
}

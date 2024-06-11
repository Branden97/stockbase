import { type Sequelize } from '@sequelize/core'
import type { JwtService, type JwtGeneratedPayload } from './middlewares/auth-middleware'

declare global {
  namespace Express {
    interface Request {
      refreshTokenPayload?: JwtGeneratedPayload
      tokenPayload?: JwtGeneratedPayload
      userId?: integer
      cookies?: Record<string, string>
    }
    interface Application {
      db: Sequelize
      jwtService: JwtService
    }
  }
}

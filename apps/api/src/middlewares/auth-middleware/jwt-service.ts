import { type Redis } from 'ioredis'
import { sign, decode, verify, type JwtPayload } from 'jsonwebtoken'
import type { SecurityHandlers } from 'express-openapi-validator/dist/framework/types'
import { v4 as uuidv4 } from 'uuid'
import { log, warn, error } from '@repo/logger'
import type { RequestHandler, Request } from 'express'
import { loadApiConfig } from '../../config'

const apiConfig = loadApiConfig()

// custom error for telling the user that they were logged out from all devices
class LoggedOutFromAllDevicesError extends Error {
  constructor() {
    super('You were logged out from all devices.')
    this.name = 'LoggedOutError'
  }
}

type SecurityHandler = SecurityHandlers[string]
export interface JwtCreationPayload {
  userId: number
}
export interface JwtGeneratedPayload extends JwtPayload, JwtCreationPayload {
  fam: string
  gen: number
}
export interface TokenPair {
  token: string
  refreshToken: string
}

export class JwtService {
  redis: Redis
  static REDIS_KEYS = {
    FAMILY_BLACKLIST: 'tokenFamilyBlacklist',
    TOKEN_BLACKLIST: 'tokenBlacklist',
    FAMILY_GENERATIONS: 'familyGenerations',
    LOGOUT_ALL_TOKENS_ISSUED_BEFORE_TIMESTAMP: 'logoutAllTokensIssuedBeforeTimestamp',
  }
  constructor(redis: Redis) {
    this.redis = redis
  }

  /**
   * Token blacklisting methods
   */
  async _isFamilyBlacklisted(fam: string): Promise<boolean> {
    try {
      const status = await this.redis.hexists(JwtService.REDIS_KEYS.FAMILY_BLACKLIST, fam)
      return Boolean(status)
    } catch (e) {
      error(`Checking if token family is blacklisted failed - assuming blacklisted. Error:`, e)
      return true
    }
  }
  // make instance method callable from static method

  async _isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const payload = decode(token, {
        json: true,
      })
      if (payload === null) return true
      const status = await this.redis.hexists(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, token)
      return Boolean(status)
    } catch (e) {
      error(`Checking if token is blacklisted failed - assuming blacklisted. Error:`, e)
      return true
    }
  }
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const payload = decode(token, {
        json: true,
      }) as JwtGeneratedPayload | null
      if (payload === null) throw new Error("Couldn't parse token!")

      return (
        (await this._isFamilyBlacklisted(payload.fam)) || (await this._isTokenBlacklisted(token))
      )
    } catch (e) {
      error(
        `Checking if token family is blacklisted failed - assuming blacklisted. Error:`,
        e,
        apiConfig.NODE_ENV
      )
      return true
    }
  }
  async blacklistFamily(fam: string): Promise<void> {
    try {
      const _status = await this.redis.hset(JwtService.REDIS_KEYS.FAMILY_BLACKLIST, fam, 1)
    } catch (e) {
      error('Token not invalidated')
    }
  }
  async blacklistToken(token: string): Promise<void> {
    try {
      // Check to make sure the token is actually a token, just in case
      const _payload = decode(token, { json: true })
      const _status = await this.redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, token, 1)
    } catch (e) {
      error('There was an error when blacklisting a token:', e)
    }
  }
  async getLastGen(fam: string): Promise<number | null> {
    try {
      const result = await this.redis.hget(JwtService.REDIS_KEYS.FAMILY_GENERATIONS, fam)
      if (result === null) return null
      return parseInt(result)
    } catch (e) {
      error('There was an error retrieving last gen:', e)
      return null
    }
  }
  async setLastGen(fam: string, gen: number): Promise<void> {
    try {
      await this.redis.hset(JwtService.REDIS_KEYS.FAMILY_GENERATIONS, fam, gen)
    } catch (e) {
      error('There was an error setting last gen:', e)
    }
  }

  /**
   * Invalidates all tokens for a given user. It does this by setting a timestamp in Redis that
   * is used to check if a token was issued before the user logged out of all devices.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves when all tokens are invalidated.
   */
  async logoutAllDevices(userId: number): Promise<void> {
    try {
      const timestamp = Math.floor(Date.now() / 1000)
      await this.redis.set(
        `${JwtService.REDIS_KEYS.LOGOUT_ALL_TOKENS_ISSUED_BEFORE_TIMESTAMP}:${userId}`,
        timestamp
      )
    } catch (e) {
      error('There was an error invalidating all tokens:', e)
    }
  }

  /**
   * Checks if a token was issued before the user last logged out from all sessions.
   * @param tokenPayload - The payload of the JWT token.
   * @param userId - The ID of the user.
   * @returns A Promise that resolves to a boolean indicating whether the token was issued before the user logged out.
   */
  async isTokenIssuedBeforeUserLoggedOutAll(
    tokenPayload: JwtGeneratedPayload,
    userId: number
  ): Promise<boolean> {
    try {
      const lastedLoggedOutAllTimestamp = await this.redis.get(
        `${JwtService.REDIS_KEYS.LOGOUT_ALL_TOKENS_ISSUED_BEFORE_TIMESTAMP}:${userId}`
      )
      if (lastedLoggedOutAllTimestamp === null) return false
      if (tokenPayload.iat === undefined) return true
      log(
        '\n\n\n\n',
        {
          thisTokenWasIssuedBeforeInvalidation:
            tokenPayload.iat < parseInt(lastedLoggedOutAllTimestamp),
          tokenPayload,
          lastedLoggedOutAllTimestamp,
        },
        '\n\n\n\n'
      )
      return tokenPayload.iat < parseInt(lastedLoggedOutAllTimestamp)
    } catch (e) {
      error('There was an error checking if a token is issued before invalidation:', e)
      return true
    }
  }

  /**
   * Creating / Refreshing JWT pairs
   */
  static createTokenPair(payload: JwtCreationPayload, fam: string = uuidv4(), gen = 0): TokenPair {
    const token = sign({ ...payload, fam, gen }, apiConfig.JWT_SECRET, {
      expiresIn: apiConfig.JWT_TTL_SECS,
    })
    const refreshToken = sign({ ...payload, fam, gen }, apiConfig.JWT_SECRET, {
      expiresIn: apiConfig.REFRESH_JWT_TTL_SECS,
    })
    return {
      token,
      refreshToken,
    }
  }

  static refreshTokenPair(refreshPayload: JwtGeneratedPayload): TokenPair {
    const gen = refreshPayload.gen + 1
    const refreshIat = refreshPayload.iat
    const newTokenPayload: JwtGeneratedPayload = {
      ...refreshPayload,
      gen,
    }
    delete newTokenPayload.exp
    delete newTokenPayload.iat
    const token = sign(newTokenPayload, apiConfig.JWT_SECRET, {
      expiresIn: apiConfig.JWT_TTL_SECS,
    })
    const refreshToken = sign({ ...refreshPayload, gen, iat: refreshIat }, apiConfig.JWT_SECRET)

    return {
      token,
      refreshToken,
    }
  }

  /**
   * Security Handlers for JWTs
   */

  /**
   * Creates a JWT security handler.
   *
   * @param tokenName - The name of the token.
   * @param isRefreshToken - Indicates whether the token is a refresh token.
   * @returns A security handler function that validates the JWT token.
   */
  static _createJwtSecurityHandler(tokenName: string, isRefreshToken: boolean): SecurityHandler {
    const securityHandler: SecurityHandler = async (req, _, __): Promise<boolean> => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- It might be undefined if mocked incorrectly
      if (req.app.jwtService === undefined)
        throw new Error(
          `JWT service not attached to app! ${
            process.env.NODE_ENV === 'test' ? ' Did you mock it correctly?' : ''
          }`
        )
      const tokenString = req.cookies?.[tokenName] as string | undefined
      if (!tokenString || typeof tokenString !== `string`) {
        warn(`"${tokenName}" missing from cookies!`)
        return false
      }
      let gen: number | undefined
      let fam: string | undefined
      try {
        verify(tokenString, apiConfig.JWT_SECRET, {
          complete: true,
        })

        let decodedToken = isRefreshToken ? req.refreshTokenPayload : req.tokenPayload
        if (decodedToken === undefined) {
          error(`"${tokenName}" wasn't parsed?!`)
          decodedToken =
            (decode(tokenString, { json: true }) as JwtGeneratedPayload | null) || undefined
          if (decodedToken === undefined) return false
        }
        gen = decodedToken.gen
        fam = decodedToken.fam

        if (await req.app.jwtService._isTokenBlacklisted(tokenString)) {
          warn(`blacklisted token used!`)
          return false
        }

        if (await req.app.jwtService._isFamilyBlacklisted(fam)) {
          warn(`"${tokenName}" with blacklisted family used!`)
          return false
        }
        const lastGen = await req.app.jwtService.getLastGen(fam)
        if ((lastGen || 0) !== gen)
          throw new Error(
            `"${tokenName}" gen mismatch! lastGen: ${lastGen}, gen: ${gen}, (lastGen || 0) < gen: ${(lastGen || 0) < gen}`
          )
        // Check if the token was issued before the user logged out of all devices
        if (
          await req.app.jwtService.isTokenIssuedBeforeUserLoggedOutAll(
            decodedToken,
            decodedToken.userId
          )
        ) {
          log(`"${tokenName}" was issued before user logged out of all devices!`)
          throw new LoggedOutFromAllDevicesError()
          return false
        }

        return true
      } catch (err) {
        // TODO: make this error bubble-up and send a user-friendly msg that they've been logged out from elsewhere
        if (err instanceof LoggedOutFromAllDevicesError) {
          throw LoggedOutFromAllDevicesError
        }

        warn(`A "${tokenName}" token has failed signature verification!`, err)
        if (fam) await req.app.jwtService.blacklistFamily(fam)
        return false
      }
    }
    return securityHandler
  }
  /**
   * OpenAPI security handler for the `token` JWT
   */
  static jwtSecurityHandler: SecurityHandler = JwtService._createJwtSecurityHandler('token', false)
  /**
   * OpenAPI security handler for the `refreshToken` JWT
   */
  static refreshJwtSecurityHandler: SecurityHandler = JwtService._createJwtSecurityHandler(
    'refreshToken',
    true
  )

  /**
   * Middleware for extracting JWTs
   */

  /**
   * Extracts the JWT token from a cookie and invokes the provided callback function with the token payload.
   * @param req - The request object.
   * @param cookieName - The name of the cookie containing the JWT token.
   * @param callback - The callback function to be invoked with the token payload.
   */
  static _extractJwtTokenFromCookie = (
    req: Request,
    cookieName: string,
    callback: (tokenPayload: JwtGeneratedPayload) => void
  ): void => {
    const tokenString = req.cookies[cookieName] as string | undefined
    if (tokenString === undefined) return
    const tokenPayload = decode(tokenString, {
      json: true,
    }) as JwtGeneratedPayload | null
    tokenPayload && callback(tokenPayload)
  }

  /**
   * Middleware function to extract JWTs from cookies and attach them (parsed) to the request object.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   */
  static extractJwtsMiddleware: RequestHandler = (req, res, next) => {
    try {
      JwtService._extractJwtTokenFromCookie(req, 'token', (tokenPayload) => {
        req.tokenPayload = tokenPayload
        if ('userId' in tokenPayload) req.userId = tokenPayload.userId
      })
      JwtService._extractJwtTokenFromCookie(req, 'refreshToken', (tokenPayload) => {
        req.refreshTokenPayload = tokenPayload
        if ('userId' in tokenPayload) req.userId = tokenPayload.userId
      })
    } catch (_err) {
      // pass
    }

    next()
  }
}

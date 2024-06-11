import * as jwt from 'jsonwebtoken'
import type Redis from 'ioredis'
import RedisMock from 'ioredis-mock'
import { v4 as uuidv4 } from 'uuid'
import type { Request as ExpressRequest, Response } from 'express'
// import type { FetchMockStatic } from 'fetch-mock'
// import fetch from 'node-fetch'
import type {
  JwtCreationPayload,
  JwtGeneratedPayload,
} from '../../middlewares/auth-middleware/jwt-service'
import { JwtService } from '../../middlewares/auth-middleware/jwt-service'
// import 'fetch-mock-jest'
import { loadApiConfig } from '../../config'
// eslint-disable-next-line @typescript-eslint/no-var-requires
// jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox())

const apiConfig = loadApiConfig() 
const exampleCreationPayload: JwtCreationPayload = {
  userId: 'myUserId',
}
const exampleGeneratedPayload: JwtGeneratedPayload = {
  ...exampleCreationPayload,
  fam: 'fam',
  gen: 1,
  exp: 1234,
}
const exampleRefreshPayload: JwtGeneratedPayload = {
  ...exampleCreationPayload,
  fam: 'fam',
  gen: 1,
  exp: 1234,
  iat: 1234,
}

const blackListedFamily = `blackListedFamily`
const legitFamily = `legitFamily`
const { token: legitToken, refreshToken: legitRefreshToken } = JwtService.createTokenPair({
  userId: 'asdf',
})
console.log(apiConfig)
const blacklistedTokenPair = JwtService.createTokenPair({ userId: 'asdf' })
const blacklistedFamilyTokenPair = JwtService.createTokenPair({ userId: 'asdf' }, blackListedFamily)

describe('createTokenPair()', () => {
  it('should return the tokens as strings', () => {
    const { token, refreshToken } = JwtService.createTokenPair({ userId: '' })
    expect(typeof token).toBe('string')
    expect(typeof refreshToken).toBe('string')
  })
  it('should include fam, gen, and userId in the payload', () => {
    const { token, refreshToken } = JwtService.createTokenPair({ userId: 'asdf' })
    const payload = jwt.decode(token, { json: true }) as JwtGeneratedPayload
    const refreshPayload = jwt.decode(refreshToken, {
      json: true,
    }) as JwtGeneratedPayload
    expect(typeof payload.fam).toBe('string')
    expect(typeof payload.gen).toBe('number')
    expect(payload.userId).toBe('asdf')
    expect(typeof refreshPayload.fam).toBe('string')
    expect(typeof refreshPayload.gen).toBe('number')
  })
  it('should set the expiration correctly', () => {
    const { token, refreshToken } = JwtService.createTokenPair({ userId: 'asdf' })
    const payload = jwt.decode(token, { json: true }) as JwtGeneratedPayload
    const refreshPayload = jwt.decode(refreshToken, {
      json: true,
    }) as JwtGeneratedPayload
    const nowSeconds = Math.floor(new Date().valueOf() / 1000)
    expect(payload.iat).toBe(nowSeconds)
    expect(payload.exp).toBe(nowSeconds + apiConfig.JWT_TTL_SECS)
    expect(refreshPayload.iat).toBe(nowSeconds)
    expect(refreshPayload.exp).toBe(nowSeconds + apiConfig.REFRESH_JWT_TTL_SECS)
  })
})
describe('refreshTokenPair()', () => {
  it('should return the tokens as strings', () => {
    const { token, refreshToken } = JwtService.refreshTokenPair(exampleRefreshPayload)
    expect(typeof token).toBe('string')
    expect(typeof refreshToken).toBe('string')
  })
  it('should include fam, gen, and userId in the payload', () => {
    const { token, refreshToken } = JwtService.refreshTokenPair(exampleRefreshPayload)
    const payload = jwt.decode(token, { json: true }) as JwtGeneratedPayload
    const refreshPayload = jwt.decode(refreshToken, {
      json: true,
    }) as JwtGeneratedPayload
    expect(typeof payload.fam).toBe('string')
    expect(typeof payload.gen).toBe('number')
    expect(payload.userId).toBe('myUserId')
    expect(typeof refreshPayload.fam).toBe('string')
    expect(typeof refreshPayload.gen).toBe('number')
  })
  it('should passthru the fam and increment the gen', () => {
    const { token, refreshToken } = JwtService.refreshTokenPair(exampleRefreshPayload)
    const payload = jwt.decode(token, { json: true }) as JwtGeneratedPayload
    const refreshPayload = jwt.decode(refreshToken, {
      json: true,
    }) as JwtGeneratedPayload
    expect(payload.fam).toBe('fam')
    expect(payload.gen).toBe(2)
    expect(refreshPayload.fam).toBe('fam')
    expect(refreshPayload.gen).toBe(2)
  })
  it('should set the expiration correctly', () => {
    const nowSeconds = Math.floor(new Date().valueOf() / 1000)
    const { token, refreshToken } = JwtService.refreshTokenPair({
      ...exampleRefreshPayload,
      iat: nowSeconds,
      exp: nowSeconds + 69,
    })
    const payload = jwt.decode(token, { json: true }) as JwtGeneratedPayload
    const refreshPayload = jwt.decode(refreshToken, {
      json: true,
    }) as JwtGeneratedPayload
    expect(payload.iat).toBe(nowSeconds)
    expect(payload.exp).toBe(nowSeconds + apiConfig.JWT_TTL_SECS)
    expect(refreshPayload.iat).toBe(nowSeconds)
    expect(refreshPayload.exp).toBe(nowSeconds + 69)
  })
  describe('returned token', () => {
    it('should give a new exp', () => {
      const { token, refreshToken } = JwtService.refreshTokenPair(exampleRefreshPayload)
      const payload = jwt.decode(token, { json: true }) as JwtGeneratedPayload
      expect(payload.exp).not.toBe(1234)
    })
  })
  describe('returned refreshToken', () => {
    it('should passthru the exp', () => {
      const { token, refreshToken } = JwtService.refreshTokenPair(exampleRefreshPayload)
      const refreshPayload = jwt.decode(refreshToken, {
        json: true,
      }) as JwtGeneratedPayload
      expect(refreshPayload.exp).toBe(1234)
    })
  })
})
describe('JwtService', () => {
  let redis: Redis
  beforeAll(() => {
    // Use in-memory Redis instance
    redis = new RedisMock()
  })
  beforeEach(async () => {
    await redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, blacklistedTokenPair.token, 1)
    await redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, blacklistedTokenPair.refreshToken, 1)
    await redis.hset(JwtService.REDIS_KEYS.FAMILY_BLACKLIST, blackListedFamily, 1)
  })
  afterEach(async () => {
    await redis.flushall()
  })
  afterAll(() => {
    redis.disconnect()
  })
  it('should connect to redis', async () => {
    const jwtService = new JwtService(redis)
    await jwtService.redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, 'token', 1337)
    const returned = await jwtService.redis.hget(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, 'token')
    expect(returned).toBe('1337')
  })
  describe('_isFamilyBlacklisted()', () => {
    it('should return true given a blacklisted family', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isFamilyBlacklisted(blackListedFamily)
      expect(result).toBe(true)
    })
    it('should return false given a legit family', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isFamilyBlacklisted(legitFamily)
      expect(result).toBe(false)
    })
  })
  describe('_isTokenBlacklisted()', () => {
    it('should return true given a blacklisted token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isTokenBlacklisted(blacklistedTokenPair.token)
      expect(result).toBe(true)
    })
    it('should return true given a blacklisted refresh token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isTokenBlacklisted(blacklistedTokenPair.token)
      expect(result).toBe(true)
    })
    it('should return true given a malformed/tampered token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isTokenBlacklisted('my.malicious.token')
      expect(result).toBe(true)
    })
    it('should return false given a legit token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isTokenBlacklisted(legitToken)
      expect(result).toBe(false)
    })
    it('should return false given a legit refresh token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService._isTokenBlacklisted(legitRefreshToken)
      expect(result).toBe(false)
    })
  })
  describe('isBlacklisted()', () => {
    it('should return true given a blacklisted token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted(blacklistedTokenPair.token)
      expect(result).toBe(true)
    })
    it('should return true given a blacklisted refresh token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted(blacklistedTokenPair.refreshToken)
      expect(result).toBe(true)
    })
    it('should return true given a malformed/tampered token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted('my.malicious.token')
      expect(result).toBe(true)
    })
    it('should return false given a legit token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted(legitToken)
      expect(result).toBe(false)
    })
    it('should return false given a legit refresh token', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted(legitRefreshToken)
      expect(result).toBe(false)
    })
    it('should return true given a token with a blacklisted family', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted(blacklistedFamilyTokenPair.token)
      expect(result).toBe(true)
    })
    it('should return true given a refresh token with a blacklisted family', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.isBlacklisted(blacklistedFamilyTokenPair.refreshToken)
      expect(result).toBe(true)
    })
  })
  describe('blacklistFamily()', () => {
    it('should blacklist any string', async () => {
      const jwtService = new JwtService(redis)
      const newFamily = uuidv4()
      const isInRedisBefore = await redis.hget(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, newFamily)
      expect(isInRedisBefore).toBeFalsy()
      await jwtService.blacklistFamily(newFamily)

      const isInRedis = await redis.hget(JwtService.REDIS_KEYS.FAMILY_BLACKLIST, newFamily)
      expect(isInRedis).toBe('1')
    })
  })
  describe('blacklistToken()', () => {
    it('should blacklist a token', async () => {
      const jwtService = new JwtService(redis)

      const isInRedisBefore = await redis.hget(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, legitToken)
      expect(isInRedisBefore).toBeFalsy()
      await jwtService.blacklistToken(legitToken)

      const isInRedis = await redis.hget(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, legitToken)
      expect(isInRedis).toBe('1')
    })
    it('should blacklist a refresh token', async () => {
      const jwtService = new JwtService(redis)

      const isInRedisBefore = await redis.hget(
        JwtService.REDIS_KEYS.TOKEN_BLACKLIST,
        legitRefreshToken
      )
      expect(isInRedisBefore).toBeFalsy()
      await jwtService.blacklistToken(legitRefreshToken)

      const isInRedis = await redis.hget(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, legitRefreshToken)
      expect(isInRedis).toBe('1')
    })
  })
  describe('getLastGen()', () => {
    const testFamily = 'some-family'
    it('should retrieve a number', async () => {
      const jwtService = new JwtService(redis)
      await redis.hset(JwtService.REDIS_KEYS.FAMILY_GENERATIONS, testFamily, 37)
      const result = await jwtService.getLastGen(testFamily)

      expect(result).toBe(37)
    })
    it('should return null when not found', async () => {
      const jwtService = new JwtService(redis)
      const result = await jwtService.getLastGen(testFamily)

      expect(result).toBe(null)
    })
  })
  describe('setLastGen()', () => {
    const testFamily = 'some-family'
    it('should update an existing number', async () => {
      const jwtService = new JwtService(redis)
      const gen = 37
      await redis.hset(JwtService.REDIS_KEYS.FAMILY_GENERATIONS, testFamily, gen)
      await jwtService.setLastGen(testFamily, gen + 1)
      const result = await redis.hget(JwtService.REDIS_KEYS.FAMILY_GENERATIONS, testFamily)
      expect(parseInt(`${result}`)).toBe(gen + 1)
    })
    it('should set a new number', async () => {
      const jwtService = new JwtService(redis)
      const gen = 0
      await jwtService.setLastGen(testFamily, gen + 1)
      const result = await redis.hget(JwtService.REDIS_KEYS.FAMILY_GENERATIONS, testFamily)
      expect(parseInt(`${result}`)).toBe(gen + 1)
    })
  })
  describe('jwtSecurityHandler()', () => {
    beforeEach(async () => {
      await redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, blacklistedTokenPair.token, 1)
      await redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, blacklistedTokenPair.refreshToken, 1)
      await redis.hset(JwtService.REDIS_KEYS.FAMILY_BLACKLIST, blackListedFamily, 1)
    })
    afterEach(async () => {
      await redis.flushall()
    })
    it('should return true, given a valid, unexpired token', async () => {
      const mockBlacklistFamily = jest.fn()

      const result = await JwtService.jwtSecurityHandler(
        {
          token: jwt.decode(legitToken),
          cookies: { token: legitToken },
          app: {
            jwtService: {
              _isTokenBlacklisted: () => false,
              _isFamilyBlacklisted: () => false,
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(true)
    })
    it('should return false, given a valid, expired token', async () => {
      const mockBlacklistFamily = jest.fn()

      const token = jwt.sign({ userId: 'asdf', fam: 'asdf', gen: 0, exp: 0 }, apiConfig.JWT_SECRET)

      const result = await JwtService.jwtSecurityHandler(
        {
          token: jwt.decode(token),
          cookies: { token },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })
    it('should return false, given a tampered, unexpired token', async () => {
      const result = await JwtService.jwtSecurityHandler(
        {
          token: jwt.decode(legitToken),
          cookies: { token: `${legitToken} ` },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: jest.fn(),
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })

    it('should return false, given a missing token', async () => {
      const result = await JwtService.jwtSecurityHandler(
        {
          // token: jwt.decode(legitToken),
          // cookies: { token: legitToken + ' ' },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: jest.fn(),
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })
    it('should return false & blacklistFamily, given a token with a less-than gen', async () => {
      const mockBlacklistFamily = jest.fn()
      const { token: legitToken } = JwtService.createTokenPair(
        {
          userId: 'asdf',
        },
        'fam',
        0
      )
      const result = await JwtService.jwtSecurityHandler(
        {
          token: jwt.decode(legitToken),
          cookies: { token: legitToken },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 1,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
      expect(mockBlacklistFamily).toHaveBeenCalledWith('fam')
    })
    it('should return false & blacklistFamily, given a token with a more-than gen', async () => {
      const mockBlacklistFamily = jest.fn()
      const { token: legitToken } = JwtService.createTokenPair(
        {
          userId: 'asdf',
        },
        'fam',
        1
      )
      const result = await JwtService.jwtSecurityHandler(
        {
          token: jwt.decode(legitToken),
          cookies: { token: legitToken },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
      expect(mockBlacklistFamily).toHaveBeenCalledWith('fam')
    })
    it('should return false, given a token with blacklisted token or family', async () => {
      const { token: legitToken } = JwtService.createTokenPair(
        {
          userId: 'asdf',
        },
        'fam',
        0
      )
      const result = await JwtService.jwtSecurityHandler(
        {
          token: jwt.decode(legitToken),
          cookies: { token: legitToken },
          app: {
            jwtService: {
              isBlacklisted: () => true,
              blacklistFamily: jest.fn(),
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })
  })
  describe('JwtService.refreshJwtSecurityHandler()', () => {
    beforeEach(async () => {
      await redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, blacklistedTokenPair.token, 1)
      await redis.hset(JwtService.REDIS_KEYS.TOKEN_BLACKLIST, blacklistedTokenPair.refreshToken, 1)
      await redis.hset(JwtService.REDIS_KEYS.FAMILY_BLACKLIST, blackListedFamily, 1)
    })
    afterEach(async () => {
      await redis.flushall()
    })
    it('should return true, given a valid, unexpired refreshToken', async () => {
      const mockBlacklistFamily = jest.fn()

      const result = await JwtService.refreshJwtSecurityHandler(
        {
          refreshToken: jwt.decode(legitRefreshToken),
          cookies: { refreshToken: legitRefreshToken },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              _isTokenBlacklisted: () => false,
              _isFamilyBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(true)
    })
    it('should return false, given a valid, expired refreshToken', async () => {
      const mockBlacklistFamily = jest.fn()

      const refreshToken = jwt.sign(
        { userId: 'asdf', fam: 'asdf', gen: 0, exp: 0 },
        apiConfig.JWT_SECRET
      )

      const result = await JwtService.refreshJwtSecurityHandler(
        {
          refreshToken: jwt.decode(legitRefreshToken),
          cookies: { refreshToken },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })
    it('should return false, given a tampered, unexpired refreshToken', async () => {
      const result = await JwtService.refreshJwtSecurityHandler(
        {
          refreshToken: jwt.decode(legitRefreshToken),
          cookies: { refreshToken: `${legitRefreshToken} ` },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: jest.fn(),
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })

    it('should return false, given a missing refreshToken', async () => {
      const result = await JwtService.refreshJwtSecurityHandler(
        {
          // refreshToken: jwt.decode(legitRefreshToken),
          // cookies: { refreshToken: legitRefreshToken  + ' ' },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: jest.fn(),
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })
    it('should return false & blacklistFamily, given a refreshToken with a less-than gen', async () => {
      const mockBlacklistFamily = jest.fn()
      const { refreshToken } = JwtService.createTokenPair(
        {
          userId: 'asdf',
        },
        'fam',
        0
      )
      const result = await JwtService.refreshJwtSecurityHandler(
        {
          refreshToken: jwt.decode(refreshToken),
          cookies: { refreshToken },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 1,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
      expect(mockBlacklistFamily).toHaveBeenCalledWith('fam')
    })
    it('should return false & blacklistFamily, given a refreshToken with a more-than gen', async () => {
      const mockBlacklistFamily = jest.fn()
      const { refreshToken } = JwtService.createTokenPair(
        {
          userId: 'asdf',
        },
        'fam',
        1
      )
      const result = await JwtService.refreshJwtSecurityHandler(
        {
          refreshToken: jwt.decode(refreshToken),
          cookies: { refreshToken },
          app: {
            jwtService: {
              isBlacklisted: () => false,
              blacklistFamily: mockBlacklistFamily,
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
      expect(mockBlacklistFamily).toHaveBeenCalledWith('fam')
    })
    it('should return false, given a refreshToken with blacklisted token or family', async () => {
      const { refreshToken } = JwtService.createTokenPair(
        {
          userId: 'asdf',
        },
        'fam',
        0
      )
      const result = await JwtService.refreshJwtSecurityHandler(
        {
          refreshToken: jwt.decode(refreshToken),
          cookies: { refreshToken },
          app: {
            jwtService: {
              isBlacklisted: () => true,
              blacklistFamily: jest.fn(),
              getLastGen: () => 0,
            },
          },
        } as unknown as ExpressRequest,
        [],
        {} as any
      )
      expect(result).toBe(false)
    })
  })
  describe('extractJwtsMiddleware()', () => {
    const mockResponse: Response = undefined as unknown as Response
    it('should add token and refreshToken to req object and call next()', async () => {
      const mockNext = jest.fn()
      const req: ExpressRequest = {
        cookies: {
          token: legitToken,
          refreshToken: legitRefreshToken,
        },
        tokenPayload: undefined,
        refreshTokenPayload: undefined,
      } as unknown as ExpressRequest
      JwtService.extractJwtsMiddleware(req, mockResponse, mockNext)
      expect(req.tokenPayload).toStrictEqual(jwt.decode(legitToken))
      expect(req.refreshTokenPayload).toStrictEqual(jwt.decode(legitRefreshToken))
      expect(mockNext).toHaveBeenCalled()
    })
    it('should add refreshToken to req object and call next() with missing token', async () => {
      const mockNext = jest.fn()
      const req: ExpressRequest = {
        cookies: {
          refreshToken: legitRefreshToken,
        },
        tokenPayload: undefined,
        refreshTokenPayload: undefined,
      } as unknown as ExpressRequest
      JwtService.extractJwtsMiddleware(req, mockResponse, mockNext)
      expect(req.refreshTokenPayload).toStrictEqual(jwt.decode(legitRefreshToken))
      expect(mockNext).toHaveBeenCalled()
    })
    it('should call next() with missing tokens', async () => {
      const mockNext = jest.fn()
      const req: ExpressRequest = {
        cookies: {},
        tokenPayload: undefined,
        refreshTokenPayload: undefined,
      } as unknown as ExpressRequest
      JwtService.extractJwtsMiddleware(req, mockResponse, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })
  })
})

import type { RequestHandler } from 'express'
import { decode } from 'jsonwebtoken'
import { asyncHandler } from '../../utils/async-handler'
import type { JwtGeneratedPayload } from '../../middlewares/auth-middleware'
import { JwtService } from '../../middlewares/auth-middleware'
import { loadApiConfig } from '../../config'

const apiConfig = loadApiConfig()

export const refreshTokenHandler: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.refreshTokenPayload?.exp) {
    res.status(401).json({ message: 'Invalid refresh token' })
    return
  }
  const { token: newToken, refreshToken: newRefreshToken } = JwtService.refreshTokenPair(
    req.refreshTokenPayload
  )
  const decodedNewToken = decode(newToken, { json: true }) as JwtGeneratedPayload | null
  const decodedNewRefreshToken = decode(newRefreshToken, {
    json: true,
  }) as JwtGeneratedPayload | null

  if (!decodedNewToken || !decodedNewRefreshToken) {
    res.status(500).json({ message: 'Failed to generate token' })
    return
  }
  if (decodedNewToken.exp === undefined || decodedNewRefreshToken.exp === undefined) {
    res.status(500).json({ message: 'Failed to generate token' })
    return
  }
  res.cookie('token', newToken, {
    expires: new Date(decodedNewToken.exp * 1000),
    httpOnly: true,
    secure: apiConfig.JWT_COOKIE_SECURE,
    domain: apiConfig.JWT_COOKIE_DOMAIN,
    sameSite: 'lax',
  })
  res.cookie('refreshToken', newRefreshToken, {
    // The refreshToken needs to be updated, but the use the original expiration timestamp
    expires: new Date(req.refreshTokenPayload.exp * 1000),
    httpOnly: true,
    secure: apiConfig.JWT_COOKIE_SECURE,
    domain: apiConfig.JWT_COOKIE_DOMAIN,
    sameSite: 'lax',
  })
  await req.app.jwtService.setLastGen(decodedNewToken.fam, decodedNewToken.gen)

  res.status(200).json(decodedNewToken)
})

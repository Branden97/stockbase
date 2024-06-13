import type { RequestHandler, Request } from 'express'
import { error } from '@repo/logger'
import { asyncHandler } from '../../utils/async-handler'

/**
 * Logout handler for the API.
 * 
 * @remarks
 * This handler is responsible for logging out a user by blacklisting a JWT token pair's family
 * and clearing the token cookies.
 * 
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @returns A Promise that resolves to void.
 */
export const logoutHandler: RequestHandler = asyncHandler(async (req: Request, res) => { 
  const fam = req.tokenPayload?.fam || req.refreshTokenPayload?.fam
  if (!fam) {
    error(`Users shouldn't be able to reach this endpoint without a token or refreshToken!`)
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  await req.app.jwtService.blacklistFamily(fam)
  res.clearCookie('token')
  res.clearCookie('refreshToken')
  res.status(200).send('Logged out successfully')
})

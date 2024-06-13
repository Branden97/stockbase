import type { RequestHandler, Request } from 'express'
import { error } from '@repo/logger'
import { asyncHandler } from '../../utils/async-handler'

/**
 * This handler logs out a user from all devices by invalidating any tokens created before the current timestamp.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @returns A Promise that resolves to void.
 */
export const logoutAllHandler: RequestHandler = asyncHandler(async (req: Request, res) => {
  const userId = req.tokenPayload?.userId || req.refreshTokenPayload?.userId
  if (!userId) {
    error(`Users shouldn't be able to reach this endpoint without a token or refreshToken!`)
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  await req.app.jwtService.logoutAllDevices(userId)
  // res.clearCookie('token')
  // res.clearCookie('refreshToken')
  res.status(200).send('Logged out successfully')
})

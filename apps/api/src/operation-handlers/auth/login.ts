/* eslint-disable @typescript-eslint/prefer-ts-expect-error -- My IDE is bugging out... decodedToken definitely isn't undefined */
/* eslint-disable @typescript-eslint/ban-ts-comment --         ^ */
import type { RequestHandler, Request } from 'express'
import { User } from '@repo/db'
import { decode } from 'jsonwebtoken'
import { asyncHandler } from '../../utils/async-handler'
import type { JwtGeneratedPayload } from '../../middlewares/auth-middleware'
import { JwtService } from '../../middlewares/auth-middleware'
import { loadApiConfig } from '../../config'

interface LoginRequest {
  email: string
  password: string
}

const apiConfig = loadApiConfig()

export const loginHandler: RequestHandler = asyncHandler(
  async (req: Request<unknown, unknown, LoginRequest>, res) => {
    const { email, password } = req.body

    // Find the user by username
    const user = await User.findOne({
      where: {
        email,
      },
    })

    if (!user) {
      res.status(401).json({ message: 'Email or password is incorrect' })
      return
    }

    // Compare the password with the hashed password
    const isPasswordCorrect = await user.checkPassword(password)

    if (!isPasswordCorrect) {
      res.status(401).json({ message: 'Email or password is incorrect' })
      return
    }

    // Generate a JWT token
    const { token, refreshToken } = JwtService.createTokenPair({ userId: user.id })
    const decodedToken = decode(token, { json: true }) as JwtGeneratedPayload | null
    const decodedRefreshToken = decode(refreshToken, { json: true }) as JwtGeneratedPayload | null

    if (!decodedToken || !decodedRefreshToken) {
      res.status(500).json({ message: 'Failed to generate token' })
      return
    }
    // Even adding this, my IDE is saying that decodedToken is possibly undefined...
    // if (decodedToken === undefined) {
    //   res.status(500).json({ message: 'Failed to generate token' })
    //   return
    // }
    res.cookie('token', token, {
      // @ts-ignore
      expires: new Date(decodedToken.exp * 1000),
      httpOnly: true,
      secure: apiConfig.JWT_COOKIE_SECURE,
      domain: apiConfig.JWT_COOKIE_DOMAIN,
      sameSite: 'lax',
    })
    res.cookie('refreshToken', refreshToken, {
      // @ts-ignore
      expires: new Date(decodedRefreshToken.exp * 1000),
      httpOnly: true,
      secure: apiConfig.JWT_COOKIE_SECURE,
      domain: apiConfig.JWT_COOKIE_DOMAIN,
      sameSite: 'lax',
    })

    res.status(200).json(decodedToken)
  }
)

import { User } from '@repo/db'
import { error as logError } from '@repo/logger'
import type { Request, Response, RequestHandler } from 'express'
import { UniqueConstraintError, ValidationError as SequelizeValidationError } from '@sequelize/core'
import { asyncHandler } from '../../utils/async-handler'

interface SignupBody {
  username: string
  firstName: string
  lastName: string
  email: string
  password: string
}

class ExistingUser extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExistingUser'
  }
}

// Signup handler
export const signupHandler: RequestHandler = asyncHandler(
  async (req: Request<unknown, unknown, SignupBody>, res: Response) => {
    try {
      // TODO: Generate types from OpenAPI schema
      const { username, email, password, firstName, lastName } = req.body

      // Check for existing username or email
      const existingUser = await User.findOne({ where: { username } })
      if (existingUser) {
        throw new ExistingUser('Username already exists')
      }
      const existingUserByEmail = await User.findOne({ where: { email } })
      if (existingUserByEmail) {
        throw new ExistingUser('Email already exists')
      }

      // Create new user instance
      const newUser =   User.build({
        username,
        firstName,
        lastName,
        email,
      })
      
      await newUser.setPassword(password)
      await newUser.save()

      res.status(201).json(newUser.toJSON())
    } catch (err: unknown) {
      handleError(err, res)
    }
  }
)

// Error handler function
const handleError = (err: unknown, res: Response) => {
  if (err instanceof ExistingUser) {
    res.status(409).json({ message: err.message })
  } else if (err instanceof SequelizeValidationError) {
    res.status(400).json({ message: 'Validation error', errors: err.errors })
  } else if (err instanceof UniqueConstraintError) {
    res.status(409).json({ message: 'Username or email already exists' })
  } else if (err instanceof Error) {
    logError('Unexpected error:', err)
    res.status(500).json({ message: 'Internal server error' })
  } else {
    logError('Unknown error:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

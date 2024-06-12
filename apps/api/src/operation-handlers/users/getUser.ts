import { User } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the response, if needed
interface UserResponse {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
}

interface Params {
  userId: string
}

/**
 * Handles the request to get user details.
 *
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response containing the user details.
 */
export const getUserHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, UserResponse>, res, next) => {
    // Extract userId from the request object
    const userId = req.userId as number | undefined
    if (userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // TODO: implement authorization logic for getting other users. For now, only allow getting the current user
    const userIdToDelete = parseInt(`${req.params.userId}`)
    if (userIdToDelete !== userId) {
      res.status(403).json({ message: 'Forbidden' })
      return
    }

    try {
      // Fetch the user from the database
      const user = await User.findByPk(userId)
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      // Construct the response object
      const response: UserResponse = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      }

      // Send the response with a 200 status code containing the user details
      res.status(200).json(response)
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

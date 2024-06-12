import { User } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the response, if needed
interface UserResponse {
  id: number
  email: string
  username: string
}

interface Params {
  userId: string
}

/**
 * Handles the request to delete a user.
 *
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const deleteUserHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, UserResponse>, res, next) => {
    // Extract userId from the request object
    const userId = req.userId as number | undefined
    if (userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // TODO: implement authorization logic for deleting other users. For now, only allow deleting the current user
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

      // Delete the user
      await user.destroy()

      // Send the response with a 200 status code indicating successful deletion
      res.status(204).send()
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

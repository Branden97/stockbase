import { User } from '@repo/db'
import type { Request, RequestHandler } from 'express'
import { asyncHandler } from '../../utils/async-handler'

// Define the type for the payload which includes user details to update
interface UpdateUserPayload {
  email?: string
  username?: string
  firstName?: string
  lastName?: string
  oldPassword?: string
  newPassword?: string
}

interface Params {
  userId: string

}

/**
 * Handles the request to update user details.
 *
 * @param req - The request object containing parameters, body, and other data.
 * @param res - The response object to send back the desired HTTP response.
 * @param next - The next function to pass control to the next middleware.
 * @returns A JSON response indicating the success or failure of the operation.
 */
export const updateUserHandler: RequestHandler = asyncHandler(
  async (req: Request<Params, unknown, UpdateUserPayload>, res, next) => {
    // Extract userId from the request object
    const userId = req.userId as number | undefined
    if (userId === undefined) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { userId: userIdToUpdate } = req.params

    // Extract and validate the request body
    const { email, username, firstName, lastName, oldPassword, newPassword } = req.body

    if (!email && !username && !firstName && !lastName && !newPassword) {
      res.status(400).json({ message: 'At least one field is required to update' })
      return
    }

    try {
      // Fetch the user from the database
      const user = await User.findByPk(userIdToUpdate)

      // TODO: implement authorization logic for updating other users. For now, only allow updating the current user
      if (parseInt(`${userIdToUpdate}`) !== userId) {
        res.status(403).json({ message: 'Forbidden' })
        return
      }

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      // If newPassword is provided, check if the oldPassword is provided and is correct
      let verifiedPassword = false
      if (newPassword) {
        if (!oldPassword) {
          res.status(401).json({ message: 'oldPassword is required' })
          return
        }
        verifiedPassword = await user.checkPassword(oldPassword)
        if (!verifiedPassword) {
          res.status(401).json({ message: 'Old password is incorrect' })
          return
        }
      }
      if (email) user.set({ email })
      if (username) user.set({ username })
      if (firstName) user.set({ firstName })
      if (lastName) user.set({ lastName })
      if (newPassword && verifiedPassword) await user.setPassword(newPassword)

      await user.save()

      // Send the response with a 200 status code indicating successful update
      res.status(200).json({ ...user.toJSON(), updatedPassword: newPassword && verifiedPassword })
    } catch (err) {
      // Pass any errors to the next middleware
      next(err)
    }
  }
)

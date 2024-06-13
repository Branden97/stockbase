import { User } from '@repo/db'
import { RequestHandler } from 'express'
import { asyncHandler } from './utils/async-handler'

// function to create user with random username, email, and password
async function createRandomUser() {
  await User.create({
    username: generateRandomLetters(8),
    email: generateRandomLetters(8) + '@example.com',
    passwordHash: generateRandomLetters(8),
    firstName: generateRandomLetters(8),
    lastName: generateRandomLetters(8),
  })
}

function generateRandomLetters(length: number) {
  // Generate a random string
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let string = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    string += characters[randomIndex]
  }
  return string
}

export const handleTestingEndpointRequest: RequestHandler = asyncHandler(async (req, res, next) => {
  try {
    const createdUser = await createRandomUser()
    throw new Error('wubalubadubdub')
    // @ts-ignore
    res.json(createdUser.toJSON())
  } catch (error) {
    next(error)
  }
})

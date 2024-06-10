import { User } from '@repo/db'
import { RequestHandler } from 'express'

// function to create user with random username, email, and password
async function createRandomUser() {
  const username = generateRandomLetters(8)
  const email = generateRandomLetters(8) + '@example.com'
  const passwordHash = generateRandomLetters(8)
  return await User.create({ username, email, passwordHash })
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

// Express endpoint handler
// eslint-disable-next-line @typescript-eslint/no-misused-promises
export const handleTestingEndpointRequest: RequestHandler = async (req, res, next) => {
  try {
    const createdUser = await createRandomUser()
    throw new Error('wubalubadubdub')
    // @ts-ignore
    return res.json(createdUser.toJSON())
  } catch (error) {
    next(error)
  }
}

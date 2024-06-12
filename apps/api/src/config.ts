// Import necessary modules
import path from 'node:path'
import * as yup from 'yup'
import { config as dotenvConfig } from 'dotenv'

// Load the environment variables from the .env file
// The `../` is needed because when it's compiled, it's looking for the .env file in the dist directory
const envPath = path.resolve(__dirname, '../', '.env')

dotenvConfig({ path: envPath })

// Define the schema for validation using yup
const configSchema = yup.object().shape({
  NODE_ENV: yup.string().oneOf(['development', 'production', 'test']).required(),
  
  JWT_SECRET: yup.string().min(64).required(),
  JWT_COOKIE_NAME: yup.string().default('token').required(),
  JWT_TTL_SECS: yup.number().min(64).required(),
  REFRESH_JWT_COOKIE_NAME: yup.string().default('refreshToken').required(),
  REFRESH_JWT_TTL_SECS: yup.number().min(64).required(),
  JWT_COOKIE_DOMAIN: yup.string().default('localhost').required(),
  JWT_COOKIE_SECURE: yup.boolean().default(true).required(),

  // Redis connection details
  REDIS_HOST: yup.string().default('localhost').required(),
  REDIS_PORT: yup.number().default(6379).required().min(1).max(65535),
  REDIS_DB: yup.number(),
  REDIS_USERNAME: yup.string(),
  REDIS_PASSWORD: yup.string(),
})

// Define a type for the configuration based on the schema
type ApiConfig = yup.InferType<typeof configSchema>

/**
 * Loads and validates the configuration for the database.
 * @returns The loaded database configuration.
 */
export function loadApiConfig(): ApiConfig {
  return configSchema.validateSync(process.env, {
    abortEarly: false,
    stripUnknown: true,
  })
}

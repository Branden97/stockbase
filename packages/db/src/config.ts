// Import necessary modules
import * as yup from 'yup'
import path from 'node:path'
import { config as dotenvConfig } from 'dotenv'

const envPath = path.resolve(__dirname, '../', '.env')

dotenvConfig({ path: envPath })

// console.log('process.env:', process.env)

// Define the schema for validation using yup
const configSchema = yup.object().shape({
  NODE_ENV: yup.string().oneOf(['development', 'production', 'test']).required(),
  POSTGRES_DATABASE: yup.string().required(),
  POSTGRES_USERNAME: yup.string().required(),
  POSTGRES_PASSWORD: yup.string().required(),
  POSTGRES_HOST: yup.string().required(),
  POSTGRES_PORT: yup.number().default(5432).required().min(1).max(65535),
  POSTGRES_SSL: yup.boolean().default(true).required(),
  POSTGRES_CLIENT_MIN_MESSAGES: yup
    .string()
    .oneOf(['DEBUG5', 'DEBUG4', 'DEBUG3', 'DEBUG2', 'DEBUG1', 'LOG', 'NOTICE', 'WARNING', 'ERROR'])
    .default('NOTICE')
    .required(),
  POSTGRES_INITIALIZE_TABLES: yup.boolean().default(false),
  POSTGRES_SCHEMA: yup.string(),
})

// Define a type for the configuration based on the schema
type DbConfig = yup.InferType<typeof configSchema>

/**
 * Loads and validates the configuration for the database.
 * @returns {DbConfig} The loaded database configuration.
 */
export function loadDbConfig(): DbConfig {
  return configSchema.validateSync(process.env, {
    abortEarly: false,
    stripUnknown: true,
  })
}

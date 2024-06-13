import { migrateUp } from '../src/umzug'

migrateUp().catch((err) => {
  console.error('Failed to run migrations:', err)
  process.exit(1)
})

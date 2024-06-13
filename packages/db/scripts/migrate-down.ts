import { migrateDown } from '../src/umzug'

migrateDown().catch((err) => {
  console.error('Failed to run migration rollback:', err)
  process.exit(1)
})

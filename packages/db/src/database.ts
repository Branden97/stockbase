import { Sequelize, Options as SequelizeOptions } from '@sequelize/core'
import { loadDbConfig } from './config'
import { User, Stock, Watchlist, WatchlistStock, StockPrice } from './models'
import { log, error as logError } from '@repo/logger'
import { seedStocks } from './seed-db'

const config = loadDbConfig()

export function createSequelizeInstance(additionalConfig: SequelizeOptions = {}): Sequelize {
  return new Sequelize({
    dialect: 'postgres',
    database: config.POSTGRES_DATABASE,
    username: config.POSTGRES_USERNAME,
    password: config.POSTGRES_PASSWORD,
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    dialectOptions: { clientMinMessages: config.POSTGRES_CLIENT_MIN_MESSAGES },
    schema: config.POSTGRES_SCHEMA,
    models: [User, Stock, Watchlist, WatchlistStock, StockPrice],
    ...additionalConfig,
  })
}

export async function connectToDatabase(): Promise<Sequelize> {
  const sequelize = createSequelizeInstance()
  // Sync all defined models to the DB if `POSTGRES_INITIALIZE_TABLES` is set to true
  if (process.env.NODE_ENV === 'development' && config.POSTGRES_INITIALIZE_TABLES) {
    sequelize
      .sync({ alter: true })
      .then(() => {
        log('Database & tables created!\n\n\n\n\n\n')
      })
      .catch((error) => {
        logError('There was an error creating the DB tables!:', error)
      })
  }

  if (process.env.NODE_ENV !== 'production' && config.POSTGRES_SEED_DB) {
    try {
      await seedStocks()
      log('Database has been seeded successfully.\n\n\n\n\n\n')
    } catch (error) {
      logError('Failed to seed the database:', error)
    }
  }

  try {
    await sequelize.authenticate()
    log('Connected to database.')
  } catch (error) {
    logError('Unable to connect to the database:', error)
  }
  return sequelize
}

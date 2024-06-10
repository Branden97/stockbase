import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Options as SequelizeOptions,
} from '@sequelize/core'
import { Attribute } from '@sequelize/core/decorators-legacy'
import { PostgresDialect } from '@sequelize/postgres'
import { loadDbConfig } from './config'
import { User, Stock, Watchlist, WatchlistStock, StockPrice } from './models'

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
        console.log('Database & tables created!')
      })
      .catch((error) => {
        console.error('There was an error creating the DB tables!:', error)
      })
  }

  try {
    await sequelize.authenticate()
    console.log('Connected to database.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
  return sequelize
}

// const jane = await User.create({
//   username: 'janedoe',
//   birthday: new Date(1980, 6, 20),
// })

// console.log(jane.toJSON())

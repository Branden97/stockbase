import { type Sequelize } from '@sequelize/core'

declare global {
  namespace Express {
    interface Application {
      db: Sequelize
    }
  }
}

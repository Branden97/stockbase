import { type MigrationContext } from '../umzug'

export async function up(queryInterface: MigrationContext): Promise<void> {
  const sequelize = queryInterface.context.sequelize

  sequelize.transaction(async (transaction) => {
    try {
      // Create users table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TABLE IF NOT EXISTS "users" (
            "id" SERIAL ,
            "username" VARCHAR(50) NOT NULL,
            "firstName" VARCHAR(100) NOT NULL,
            "lastName" VARCHAR(100) NOT NULL,
            "email" VARCHAR(100) NOT NULL,
            "passwordHash" VARCHAR(255) NOT NULL,
            "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            "deletedAt" TIMESTAMP(6) WITH TIME ZONE,
            CONSTRAINT "users_username_unique" UNIQUE ("username"),
            CONSTRAINT "users_email_unique" UNIQUE ("email"),
            PRIMARY KEY ("id")
          );
        `,
        { transaction }
      )

      // Create stocks table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TABLE IF NOT EXISTS "stocks" (
            "id" SERIAL,
            "symbol" VARCHAR(10),
            "companyName" VARCHAR(255),
            "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            CONSTRAINT "stocks_symbol_unique" UNIQUE ("symbol"),
            PRIMARY KEY ("id")
          );
        `,
        { transaction }
      )

      // Create watchlists table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TABLE IF NOT EXISTS "watchlists" (
            "id" SERIAL,
            "name" VARCHAR(100),
            "userId" INTEGER NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            PRIMARY KEY ("id")
          );
        `,
        { transaction }
      )

      // Create watchlistStocks table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TABLE IF NOT EXISTS "watchlistStocks" (
            "id" SERIAL,
            "watchlistId" INTEGER NOT NULL REFERENCES "watchlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            "stockId" INTEGER NOT NULL REFERENCES "stocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            PRIMARY KEY ("id")
          );
        `,
        { transaction }
      )

      // Create stockPrices table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TABLE IF NOT EXISTS "stockPrices" (
            "id" SERIAL,
            "stockId" INTEGER NOT NULL REFERENCES "stocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            "price" DECIMAL(10, 2),
            "recordedAt" TIMESTAMP WITH TIME ZONE,
            "createdAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            "updatedAt" TIMESTAMP(6) WITH TIME ZONE NOT NULL,
            PRIMARY KEY ("id")
          );
        `,
        { transaction }
      )
    } catch (error: any) {
      console.error(error.message)
      transaction.rollback()
      throw error.message
    }
  })
}

export async function down(queryInterface: MigrationContext): Promise<void> {
  //   await queryInterface.context.dropTable('stockPrices', { cascade: true })
  //   await queryInterface.context.dropTable('watchlistStocks', { cascade: true })
  //   await queryInterface.context.dropTable('wathclists', { cascade: true })
  //   await queryInterface.context.dropTable('stocks', { cascade: true })
  //   await queryInterface.context.dropTable('users', { cascade: true })
  await queryInterface.context.dropAllTables()
}

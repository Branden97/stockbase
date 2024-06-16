import { type MigrationContext } from '../umzug'

export async function up(queryInterface: MigrationContext): Promise<void> {
  const sequelize = queryInterface.context.sequelize

  await sequelize.transaction(async (transaction) => {
    try {
      // Create users table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TABLE IF NOT EXISTS "users" (
            "id" SERIAL,
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
            "industry" VARCHAR(255),
            "latestPrice" DECIMAL(20, 10),
            "percentChange" DECIMAL(20, 10),
            "recordedAt" TIMESTAMP WITH TIME ZONE,
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
            "price" DECIMAL(20, 10),
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
      await transaction.rollback()
      throw error.message
    }
  })

  await sequelize.transaction(async (transaction) => {
    try {
      // Create function to update stocks table
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE OR REPLACE FUNCTION update_stocks() RETURNS TRIGGER AS $$
          DECLARE
            old_price DECIMAL(20, 10);
            new_price DECIMAL(20, 10);
          BEGIN
            -- Get the latest price before the new insert/update
            SELECT price INTO old_price FROM "stockPrices"
            WHERE "stockId" = NEW."stockId"
            ORDER BY "recordedAt" DESC
            LIMIT 1 OFFSET 1;

            -- Get the new price
            SELECT price INTO new_price FROM "stockPrices"
            WHERE id = NEW.id;

            -- Update the stocks table
            UPDATE stocks
            SET
              "latestPrice" = new_price,
              "percentChange" = CASE WHEN old_price IS NOT NULL THEN ((new_price - old_price) / old_price) * 100 ELSE 0 END,
              "recordedAt" = NEW."recordedAt",
              "updatedAt" = NOW()
            WHERE id = NEW."stockId";

            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `,
        { transaction }
      )

      // Create trigger to call the function on insert or update
      await queryInterface.context.sequelize.queryRaw(
        `
          CREATE TRIGGER stockPrices_after_insert_update
          AFTER INSERT OR UPDATE ON "stockPrices"
          FOR EACH ROW
          EXECUTE FUNCTION update_stocks();
        `,
        { transaction }
      )
    } catch (error: any) {
      console.error(error.message)
      await transaction.rollback()
      throw error.message
    }
  })
}

export async function down(queryInterface: MigrationContext): Promise<void> {
  await queryInterface.context.sequelize.transaction(async (transaction) => {
    try {
      // Drop the trigger and function
      await queryInterface.context.sequelize.queryRaw(
        `DROP TRIGGER IF EXISTS stockPrices_after_insert_update ON "stockPrices";`,
        { transaction }
      )
      await queryInterface.context.sequelize.queryRaw(
        `DROP FUNCTION IF EXISTS update_stocks;`,
        { transaction }
      )

      // Drop all tables
      await queryInterface.context.dropAllTables({ transaction })
    } catch (error: any) {
      console.error(error.message)
      await transaction.rollback()
      throw error.message
    }
  })
}

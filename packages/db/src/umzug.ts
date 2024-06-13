import { Umzug, SequelizeStorage } from 'umzug'; 
import { createSequelizeInstance } from './database';
import { PostgresQueryInterface } from '@sequelize/postgres';
 

export interface MigrationContext {
  path: string
  name: string
  context: PostgresQueryInterface
}

// Initialize Sequelize instance
export const sequelize = createSequelizeInstance({logging: false})

// Initialize Umzug
export const umzug = new Umzug({
  migrations: {
    glob: 'src/migrations/*.ts',
  },
  storage: new SequelizeStorage({ sequelize }),
  context: sequelize.getQueryInterface(),
  logger: console,
});

// Export a function to run migrations
export const migrateUp = async () => {
  await umzug.up();
  console.log('Migrations applied');
};
export const migrateDown = async () => {
  await umzug.down();
  console.log('Migrations applied');
};
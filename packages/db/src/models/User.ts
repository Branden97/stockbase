import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from '@sequelize/core'
import {
  Attribute,
  Table,
  PrimaryKey,
  AutoIncrement,
  Unique,
  NotNull,
  HasMany,
} from '@sequelize/core/decorators-legacy'
import { Watchlist } from './Watchlist'

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
//   @NotNull
//   @PrimaryKey
//   @AutoIncrement
//   @Attribute(DataTypes.INTEGER)
//   declare id: CreationOptional<number>

  @Unique
  @NotNull
  @Attribute(DataTypes.STRING(50))
  declare username: string

  @Unique
  @NotNull
  @Attribute(DataTypes.STRING(100))
  declare email: string

  @NotNull
  @Attribute(DataTypes.STRING(255))
  declare passwordHash: string

  // has many watchlists
  @HasMany(() => Watchlist, 'userId')
  declare watchlists: CreationOptional<Watchlist[]>
}
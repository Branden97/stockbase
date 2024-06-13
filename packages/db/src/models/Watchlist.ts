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
  BelongsTo,
  HasMany,
  NotNull,
} from '@sequelize/core/decorators-legacy'
import { User } from './User'
import { WatchlistStock } from './WatchlistStock'

@Table({
  tableName: 'watchlists',
  timestamps: true,
})
export class Watchlist extends Model<
  InferAttributes<Watchlist>,
  InferCreationAttributes<Watchlist>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(100))
  declare name: string

  // belongs to user
  @BelongsTo(() => User, { foreignKey: 'userId' })
  declare user: CreationOptional<User>

  // This is the foreign key
  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare userId: number

  // has many watchlistStocks
  @HasMany(() => WatchlistStock, { foreignKey: 'watchlistId', inverse: 'watchlist' })
  declare watchlistStocks: CreationOptional<WatchlistStock[]>

  // TODO: look into why this method isn't being added by sequelize
  // declare addStocks: HasManyAddAssociationsMixin<Stock, number>
}

import { Model, DataTypes, InferAttributes, InferCreationAttributes } from '@sequelize/core'
import {
  Attribute,
  Table,
  CreatedAt,
  UpdatedAt,
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
  declare id: number

  @Attribute(DataTypes.STRING(100))
  declare name: string

  // belongs to user
  @BelongsTo(() => User, { foreignKey: 'userId' })
  declare user: User

  // This is the foreign key
  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare userId: number;

  // has many watchlistStocks
  @HasMany(() => WatchlistStock, { foreignKey: 'watchlistId', inverse: 'watchlist' })
  declare watchlistStocks: WatchlistStock[]
}

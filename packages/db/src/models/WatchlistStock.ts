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
  NotNull,
} from '@sequelize/core/decorators-legacy'
import { Watchlist } from './Watchlist'
import { Stock } from './Stock'

@Table({
  tableName: 'watchlistStocks',
  timestamps: true,
})
export class WatchlistStock extends Model<
  InferAttributes<WatchlistStock>,
  InferCreationAttributes<WatchlistStock>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>

  // @BelongsTo(() => Watchlist, { foreignKey: 'watchlistId' })
  // @Attribute(DataTypes.INTEGER)
  // declare watchlist: Watchlist

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare watchlistId: number

  // @BelongsTo(() => Stock, { foreignKey: 'stockId' })
  // @Attribute(DataTypes.INTEGER)
  // declare stock: Stock

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare stockId: number
}

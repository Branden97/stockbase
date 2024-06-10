import { Model, DataTypes, InferAttributes, InferCreationAttributes } from '@sequelize/core'
import {
  Attribute,
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  NotNull,
} from '@sequelize/core/decorators-legacy'
import { Watchlist } from './Watchlist'
import { Stock } from './Stock'

@Table({
  tableName: 'watchlist_stocks',
  timestamps: true,
})
export class WatchlistStock extends Model<
  InferAttributes<WatchlistStock>,
  InferCreationAttributes<WatchlistStock>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: number
 
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

import { Model, DataTypes, InferAttributes, InferCreationAttributes } from '@sequelize/core'
import {
  Attribute,
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
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

  @ForeignKey(() => Watchlist)
  @Attribute(DataTypes.INTEGER)
  declare watchlist_id: number

  @ForeignKey(() => Stock)
  @Attribute(DataTypes.INTEGER)
  declare stock_id: number

  @BelongsTo(() => Watchlist)
  watchlist: Watchlist

  @BelongsTo(() => Stock)
  stock: Stock

  @CreatedAt
  @Attribute(DataTypes.DATE)
  declare created_at: Date

  @UpdatedAt
  @Attribute(DataTypes.DATE)
  declare updated_at: Date
}

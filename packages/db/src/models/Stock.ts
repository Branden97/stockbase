import { Model, DataTypes, InferAttributes, InferCreationAttributes } from '@sequelize/core'
import {
  Attribute,
  Table,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  Unique,
  HasMany,
} from '@sequelize/core/decorators-legacy'
import { WatchlistStock } from './WatchlistStock'
import { StockPrice } from './StockPrice'

@Table({
  tableName: 'stocks',
  timestamps: true,
})
export class Stock extends Model<InferAttributes<Stock>, InferCreationAttributes<Stock>> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: number

  @Unique
  @Attribute(DataTypes.STRING(10))
  declare symbol: string

  @Attribute(DataTypes.STRING(255))
  declare companyName: string

  // has many watchlistStocks
  @HasMany(() => WatchlistStock, { foreignKey: 'stockId', inverse: 'stock' })
  declare watchlistStocks: WatchlistStock[]

  // has many stockPrices
  @HasMany(() => StockPrice, { foreignKey: 'stockId', inverse: 'stock' })
  declare stockPrices: StockPrice[]

}

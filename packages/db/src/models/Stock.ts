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
  HasMany,
  NotNull,
} from '@sequelize/core/decorators-legacy'
import { WatchlistStock } from './WatchlistStock'
import { StockPrice } from './StockPrice'

@Table({
  tableName: 'stocks',
  timestamps: true,
})
export class Stock extends Model<InferAttributes<Stock>, InferCreationAttributes<Stock>> {
  @NotNull
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: CreationOptional<number>

  @Unique
  @Attribute(DataTypes.STRING(10))
  declare symbol: string

  @Attribute(DataTypes.STRING(255))
  declare companyName: string

  @Attribute(DataTypes.STRING(255))
  declare industry: string
  
  @Attribute(DataTypes.DECIMAL(20, 10))
  declare latestPrice: string

  @Attribute(DataTypes.DECIMAL(20, 10))
  declare percentChange: string

  @Attribute(DataTypes.DATE)
  declare recordedAt: Date

  // has many watchlistStocks
  @HasMany(() => WatchlistStock, { foreignKey: 'stockId', inverse: 'stock' })
  declare watchlistStocks: CreationOptional<WatchlistStock[]>

  // has many stockPrices
  @HasMany(() => StockPrice, { foreignKey: 'stockId', inverse: 'stock' })
  declare stockPrices: CreationOptional<StockPrice[]>
}

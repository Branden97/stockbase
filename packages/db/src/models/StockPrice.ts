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
import { Stock } from './Stock'

@Table({
  tableName: 'stockPrices',
  timestamps: true,
})
export class StockPrice extends Model<
  InferAttributes<StockPrice>,
  InferCreationAttributes<StockPrice>
> {
  @PrimaryKey
  @AutoIncrement
  @Attribute(DataTypes.INTEGER)
  declare id: number

  @NotNull
  @Attribute(DataTypes.INTEGER)
  declare stockId: number

  @Attribute(DataTypes.DECIMAL(10, 2))
  declare price: number

  @Attribute(DataTypes.DATE)
  declare recordedAt: Date

  // @BelongsTo(() => Stock)
  // stock: Stock
}

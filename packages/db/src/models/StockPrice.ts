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
import { Stock } from './Stock'

@Table({
  tableName: 'stock_prices',
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

  @ForeignKey(() => Stock)
  @Attribute(DataTypes.INTEGER)
  declare stock_id: number

  @Attribute(DataTypes.DECIMAL(10, 2))
  declare price: number

  @Attribute(DataTypes.DATE)
  declare recorded_at: Date

  @BelongsTo(() => Stock)
  stock: Stock

  @CreatedAt
  @Attribute(DataTypes.DATE)
  declare created_at: Date

  @UpdatedAt
  @Attribute(DataTypes.DATE)
  declare updated_at: Date
}

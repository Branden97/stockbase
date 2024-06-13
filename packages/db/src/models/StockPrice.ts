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
  declare id: CreationOptional<number>

  @NotNull
  @Attribute(DataTypes.INTEGER)
  declare stockId: number

  @Attribute(DataTypes.DECIMAL(20, 10))
  declare price: string

  @Attribute(DataTypes.DATE)
  declare recordedAt: Date

  // @BelongsTo(() => Stock)
  // stock: Stock
}

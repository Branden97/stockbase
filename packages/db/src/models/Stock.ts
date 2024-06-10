import { Model, DataTypes, InferAttributes, InferCreationAttributes } from '@sequelize/core'
import {
  Attribute,
  Table,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  Unique,
} from '@sequelize/core/decorators-legacy'

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
  declare company_name: string

  @CreatedAt
  @Attribute(DataTypes.DATE)
  declare created_at: Date

  @UpdatedAt
  @Attribute(DataTypes.DATE)
  declare updated_at: Date
}
